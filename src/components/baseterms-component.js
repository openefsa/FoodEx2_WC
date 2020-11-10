/*
 * *********************************************************************
 * |                                                                    
 * | File: \src\components\baseterms-component.js
 * | Project: foodex2-smart-coding-app-frontend
 * | Created Date: 2nd April 2020
 * | Author: Alban Shahaj (shahaal)
 * | Email: data.collection@efsa.europa.eu
 * | -----------------------------------------------------------------  
 * | Last Modified: Thursday, 7th October 2020
 * | Modified By: Alban Shahaj (shahaal)
 * | -----------------------------------------------------------------  
 * | Copyright (c) 2020 European Food Safety Authority (EFSA)
 * |                                                                    
 * *********************************************************************
 */



import {
    LitElement,
    html,
    css
} from 'lit-element'

class Term {
    /**
     * Constructor of term class.
     * 
     * @param {*} code 
     * @param {*} obj 
     */
    constructor(code, obj) {
        this.code = code;
        this.name = obj.termExtendedName;
        this.commonName = obj.commonNames;
        this.scientificName = obj.scientificNames;
        this.scopeNote = obj.termScopeNote;
        this.termType = obj.termType;
        this.detailLevel = obj.detailLevel;
        this.deprecated = obj.deprecated;
        this.implicitFacets = obj.allFacets;
        this.acc = parseInt(obj.acc*100);
    }
}

/**
 * Overrides default toString method.
 */
Term.prototype.toString = function toString() {
    var ret = 'Code: ' + this.code + 
            '\nName: ' + this.name + 
            '\nAccuracy: ' + this.acc + "%";
    return ret;
}

class BasetermsComponent extends LitElement {
    
    static get properties() {
        return {
            fieldId: {
                type: String
            },
            baseterms: {
                type: Object
            }
        }
    }

    static get styles() {
        return css`

            #btViewer {
                height:40px;
                border:1px solid lightgray;
                border-radius: 4px;
                overflow-x: auto;
                white-space: nowrap;
            }

            #btViewer > * {
                margin: 2px;
            }

            .bt {
                font-family: Arial;
                font-size: 13px;
                width:auto;
                height:30px;
                border: 1px solid lightgray;
                border-radius: 4px;
                text-align: center;
                padding: 5px; 
                cursor: pointer;
            }
                   
            .bt:hover {
                background: #d8e3f0;
                color: #2f3774; 
            }

            .inner-tag {
                font-family: Arial;
                font-size: 9px;
                width:auto;
                background: gray;
                color: #fff;
                border-radius: 4px;
                text-align: center;
                margin-left: 5px;
                padding: 2px; 
                cursor: pointer;
            }

            /* width */
            ::-webkit-scrollbar {
                width: 5px;
            }

            /* height */
            ::-webkit-scrollbar {
                height: 5px;
            }

            /* Track */
            ::-webkit-scrollbar-track {
                background: #f1f1f1; 
            }
            
            /* Handle */
            ::-webkit-scrollbar-thumb {
                background: #888; 
            }

            /* Handle on hover */
            ::-webkit-scrollbar-thumb:hover {
                background: #555; 
            }
            
        `;
    }

    constructor() {
        super();
        this.fieldId = "btViewer";
        this.baseterms = null;
    }

    render() {
        return html `
            <div>Select a base term</div>
            <div id="${this.fieldId}"></div>
            `
    }

    /**
     * Update div UI when specific property value is changed.
     * 
     * @param  {*} changedProperties
     */
    shouldUpdate(changedProperties) {

        var newBaseterms = changedProperties.has('baseterms');
        
        // if new baseterms list update field
        if (newBaseterms) {
            this.populateBaseterms();
        }
        
        return newBaseterms;
    }

    /**
     * Populate the baseterms-component with the list of returned base terms.
     */
    populateBaseterms() {

        // get the fiels component
        var tagInput = this.shadowRoot.getElementById(this.fieldId);

        // return if div undefined
        if (!tagInput)
            return;

        // clean the component content
        tagInput.innerHTML = null;
        
        // map each baseterm
        var results = Object.entries(this.baseterms).map(([k, v]) => new Term(k, v));
        
        // flag for auto-selecting first term
        var flag = true;

        // iterate each baseterm in list
        results.forEach(term => {

            // create inner tag with baseterm properties
            var tag = document.createElement('button');
            tag.setAttribute('class', 'bt');
            tag.innerHTML = term.name;
            // use the toString and shows the tooltip with term information
            tag.title = term; 
            
            // append the inner label to the tag
            var innerTag = document.createElement('tag');
            innerTag.setAttribute('class', 'inner-tag');
            innerTag.innerHTML = term.acc+"%";
            tag.appendChild(innerTag);

            // when clicking on tag
            tag.onclick = () => {
                
                if (tag.style.backgroundColor === "") {
                    // clean all buttons styles since only single term can be selected
                    Array.from(tagInput.getElementsByTagName("button")).forEach(term => {
                        term.style.background = ""
                    });
                    // apply the selection only to single term (since olny one baseterm can be selected)
                    tag.style.backgroundColor = "#bad0e7";
                    
                    // update the selected baseterm
                    this.updatedBt(term);
                } else {
                    // reset button style
                    tag.style.backgroundColor = "";
                    // update the selected baseterm
                    this.updatedBt(null);
                }
            };

            // append the new inner tag
            tagInput.appendChild(tag);

            // auto select first term
            if(localStorage.getItem('btAutoSel')==='true' && flag){
                tag.onclick.apply(tag);
                flag=!flag;
            }

        }, this);
    }

    /**
     * Fire a custom event to parent when base term selection changes.
     * 
     * @param  {Term} bt selected base term
     */
    updatedBt(bt) {
        let event = new CustomEvent('bt', {detail: bt});
        this.dispatchEvent(event);
    }

}

customElements.define("baseterms-component", BasetermsComponent)