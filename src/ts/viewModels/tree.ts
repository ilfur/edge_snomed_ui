import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import "ojs/ojknockout";
//import { whenDocumentReady } from 'ojs/ojbootstrap';
import * as jsonData from "text!../jsonData.json";
import ArrayTreeDataProvider = require("ojs/ojarraytreedataprovider");
import { FetchByKeysResults } from "ojs/ojdataprovider";
import { ojTreeView } from "ojs/ojtreeview";
import { ObservableKeySet } from "ojs/ojknockout-keyset";
import "ojs/ojtreeview";
import "ojs/ojbutton";
import "ojs/ojinputtext";

interface ConceptItem {
    conceptId: string;
    term: string;
    definition: string;
}

interface PreProcessedConceptItem extends ConceptItem {
    children?: Array<ConceptItem>;
}

interface PostProcessedConceptItem extends ConceptItem {
    children?: ko.ObservableArray<ConceptItem>;
}

class DashboardViewModel {

  readonly selectedNodeTitle = ko.observable('');
  readonly selectedNodeConceptId = ko.observable('');
  readonly selectedNodeDetail = ko.observable('');
  readonly selectedItem = ko.observable("none");
  readonly restServerURL : string = "/edge/snomed/concepts/";

  newNodeCounter = 0;

  constructor() {
  }

  createNestedObservableArray = (data: Array<ConceptItem>) => {
      return ko.observableArray(
        data.map((node: PreProcessedConceptItem) => {
          const newNode = {
            term: node.term,
	    conceptId: node.conceptId,
	    definition: node.definition
          } as PostProcessedConceptItem;
          if (node.children) {
            newNode.children = this.createNestedObservableArray(node.children);
	  } else {
	    newNode.children = ko.observableArray([]);
	  }
          return newNode;
        })
      );
  };

  readonly conceptData = this.createNestedObservableArray([{conceptId: "http://snomed.info/id/138875005", term: "SNOMED CT Concept", definition: "SNOMED CT has been created by combining SNOMED RT and a computer-based nomenclature and classification known as Read Codes Version 3, which was created on behalf of the U.K. Department of Health."}]);
  readonly expanded = new ObservableKeySet().add(["http://snomed.info/id/138875005"]);
  readonly dataprovider = new ArrayTreeDataProvider(this.conceptData(), {
       keyAttributes: "conceptId",
  });

  addChildConcept = (concept: ConceptItem) => {
      const treeView = document.getElementById("snomedtreeview") as ojTreeView<ConceptItem['conceptId'], ConceptItem>;
      const id = treeView.currentItem;
      if (!id) {
        return;
      }
      const alreadyExists = this.findNode(this.conceptData, concept.conceptId);
      if ( alreadyExists ) { //already retrieved before / only unique IDs allowed
        return;
      }

      const target = this.findNode(this.conceptData, id);
      const targetNode = target.observableData()[target.index];
      this.expanded.add([id]);
      if (targetNode.children) {
        targetNode.children.push(concept);
      } else {
        const targetNodeWithChild = {
          term: targetNode.term,
          conceptId: targetNode.conceptId
        } as PostProcessedConceptItem;
        targetNodeWithChild.children = ko.observableArray([concept]);
        target.observableData.splice(target.index, 1, targetNodeWithChild);
      }
  };

  fetchData = (id: string) => {
    var self = this; //or use the "...this" syntax instead when using a "prior" this
    var ajaxSettings = {
        url: self.restServerURL+id+"/children",
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            console.log(result);
	    if (result.length > 0) {
	      result.forEach(function (item, index) {
		 self.addChildConcept(item);
              });
	    }
        }
    }
    $.ajax(ajaxSettings);
  }

  currentItemChanged = (event: ojTreeView.currentItemChanged<ConceptItem['conceptId'], ConceptItem>) => {
      this.getTreeData(event.detail.value);
      console.log("currentItemChanged called");
      this.fetchData(event.detail.value.substring(22));
  };

  getTreeData = (id: string) => {
      this.dataprovider
        .fetchByKeys({ keys: new Set([id]) })
        .then((e: FetchByKeysResults<ConceptItem['conceptId'], ConceptItem>) => {
          if (e.results.get(id)) {
            this.selectedNodeTitle(e.results.get(id).data.term);
            this.selectedNodeDetail(e.results.get(id).data.definition);
            this.selectedNodeConceptId(e.results.get(id).data.conceptId.substring(22));
          }
        });
  };

  // finds the node in the nested observable array structure
  // returns an object containing the index of the target node (index),
  // and the the observable data array it belongs to (observableData)
  findNode = (data: ko.ObservableArray, id: string) => {
    const dataArray = data();
    for (let i = 0; i < dataArray.length; i += 1) {
      if (dataArray[i].conceptId == id) {
        const target = {
          observableData: data,
          index: i
        };
        return target;
      } else if (dataArray[i].children) {
        const target = this.findNode(dataArray[i].children, id);
        if (target) {
          return target;
        }
      }
    }
  };

  /**
   * Optional ViewModel method invoked after the View is inserted into the
   * document DOM.  The application can put logic that requires the DOM being
   * attached here.
   * This method might be called multiple times - after the View is created
   * and inserted into the DOM and after the View is reconnected
   * after being disconnected.
   */
  connected(): void {
    AccUtils.announce("TreeView page loaded.");
    document.title = "SNOMED Tree View";
    // implement further logic if needed
  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    // implement if needed
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }
}

export = DashboardViewModel;
