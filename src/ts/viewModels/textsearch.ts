import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import "ojs/ojknockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import MutableArrayDataProvider= require("ojs/ojmutablearraydataprovider");
import { ojTable } from "ojs/ojtable";
import { KeySetImpl, AllKeySetImpl } from "ojs/ojkeyset";
import "ojs/ojtable";
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

class TxtSearchViewModel {

  readonly selectionText = ko.observable('');
  readonly searchText = ko.observable('');
  readonly restServerURL : string = "/edge/snomed/concepts/textsearch";
  readonly selectedItems = ko.observable({
      row: new KeySetImpl(),
      column: new KeySetImpl(),
  });


  constructor() {
  }

  //readonly conceptData = ko.observableArray([]);
  readonly conceptData = [{conceptId:"n/a",term:"n/a",definition:"n/a"}];
  readonly dataprovider = new MutableArrayDataProvider<ConceptItem["conceptId"],ConceptItem> (this.conceptData, {
       keyAttributes: "conceptId",
       implicitSort: [{ attribute: "term", direction: "ascending" }],
  });

  fetchData = () => {
    var self = this; //or use the "...this" syntax instead when using a "prior" this
    var ajaxSettings = {
        url: self.restServerURL+"?text="+self.searchText(),
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            console.log(result);
	    if (result.length > 0) {
	      //result.forEach(function (item, index) {
	      //     self.conceptData.push(item);
	      //  });
              self.dataprovider.data = result;
	      //let tab = document.getElementById("snomedtable") as ojTable<ConceptItem["conceptId"],ConceptItem>;
	      //tab.refresh();
	    }
        }
    }
    $.ajax(ajaxSettings);
  }

  selectionChanged = (event: ojTable.selectedChanged<ConceptItem['conceptId'], ConceptItem>) => {
     //const row = event.detail.value.row as KeySetImpl<number>;
	     //const column = event.detail.value.column as KeySetImpl<number>;
		     //if (row.values().size > 0) {
		     //row.values().forEach(function (key) {
		     //this.selectionText += this.selectionText.length === 0 ? key : ", " + key;
		     //});
		     //this.selectionText = "Row Keys: " + this.selectionText;
		     //}
		     //if (column.values().size > 0) {
		     //column.values().forEach(function (key) {
		     //this.selectionText += this.selectionText.length === 0 ? key : ", " + key;
		     //});
		     //this.selectionText = "Column Keys: " + this.selectionText;
		     // }
      console.log("selectionChanged called");
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

export = TxtSearchViewModel;
