import { LightningElement, wire, api } from 'lwc';
import getParentAccounts from '@salesforce/apex/AccountHelper.getParentAccounts'
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { createRecord, getFieldValue, getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account'
import PARENT_ACCOUNT_FIELD from '@salesforce/schema/Account.ParentId';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import SLA_EXPIRATION_DATE_FIELD from '@salesforce/schema/Account.SLAExpirationDate__c';
import SLA_TYPE_FIELD from '@salesforce/schema/Account.SLA__c';
import NO_OF_LOCATIONS_FIELD from '@salesforce/schema/Account.NumberofLocations__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Account.Description';
import { NavigationMixin } from 'lightning/navigation';

const fieldsToLoad = [
                        PARENT_ACCOUNT_FIELD, 
                        ACCOUNT_NAME_FIELD,
                        SLA_EXPIRATION_DATE_FIELD,
                        SLA_TYPE_FIELD,
                        NO_OF_LOCATIONS_FIELD,
                        DESCRIPTION_FIELD
                    ];
export default class AccountDetails extends NavigationMixin(LightningElement) {
    parentOptions = [];
    accountRecordTypeId;
    errors;
    result;
    selectedParentAccount;
    selectedAccountName;
    selectedSlaExpirationDate = null;
    selectedSlaType;
    selectedNoOfLocations="1";
    selectedDescription="";

    @api recordId; // to get the record

    @wire(getRecord, {
        recordId: "$recordId",
        fields : fieldsToLoad
    }) wired_getRecordsData({data, error}){
        if(data){
            this.selectedParentAccount = getFieldValue(data, PARENT_ACCOUNT_FIELD);
            this.selectedAccountName = getFieldValue(data, ACCOUNT_NAME_FIELD);
            this.selectedSlaExpirationDate = getFieldValue(data, SLA_EXPIRATION_DATE_FIELD);
            this.selectedSlaType = getFieldValue(data, SLA_TYPE_FIELD);
            this.selectedNoOfLocations = getFieldValue(data, NO_OF_LOCATIONS_FIELD);
            this.selectedDescription = getFieldValue(data, DESCRIPTION_FIELD);
        } else if(error){
            console.log('error');
        }
    }
    
    @wire(getParentAccounts) wired_getParentAccount({data, error}){
        this.parentOptions = [];
        if(data){
            this.parentOptions = data.map((currItem) => ({
                label : currItem.Name,
                value : currItem.Id
            }));
        } else if(error){
            console.log('Error while getting Parent Records', error);
        }
    }

    @wire(getObjectInfo, { 
        objectApiName: ACCOUNT_OBJECT 
    }) accountObjectInfo({data, error}){
        if(data){
            this.accountRecordTypeId = data.defaultRecordTypeId;
            this.errors = undefined;
        }else{
            this.errors = error;
            this.accountRecordTypeId = undefined;
        }
    }

    @wire(getPicklistValues, { 
        recordTypeId: "$accountRecordTypeId", 
        fieldApiName: SLA_TYPE_FIELD 
    }) pickListResults({data, error}){
        if(data){
            this.result = data.values;
            this.errors = undefined;
        } else{
            this.result = undefined;
            this.errors = error;
        }
    }

    handleChange(event){
        let {name, value} = event.target;
        if(name == 'parentAccount'){
            this.selectedParentAccount = value;
        }
        if(name == 'accountName'){
            this.selectedAccountName = value;
        }
        if(name == 'slaExpirationDate'){
            this.selectedSlaExpirationDate = value;
        }
        if(name == 'slaType'){
            this.selectedSlaType = value;
        }
        if(name == 'noOfLocations'){
            this.selectedNoOfLocations = value;
        } 
        if(name == 'description'){
            this.selectedDescription = value;
        } 
    }
    saveRecord(){
        console.log("ACCOUNT_OBJECT", ACCOUNT_OBJECT);
        console.log("ACCOUNT_NAME_FIELD", ACCOUNT_NAME_FIELD);
        
        if(this.validateInput()){
            
            let inputFields = {};
            inputFields[PARENT_ACCOUNT_FIELD.fieldApiName] = this.selectedParentAccount;
            inputFields[ACCOUNT_NAME_FIELD.fieldApiName] = this.selectedAccountName;
            inputFields[SLA_EXPIRATION_DATE_FIELD.fieldApiName] = this.selectedSlaExpirationDate;
            inputFields[SLA_TYPE_FIELD.fieldApiName] = this.selectedSlaType;
            inputFields[NO_OF_LOCATIONS_FIELD.fieldApiName] = this.selectedNoOfLocations;
            inputFields[DESCRIPTION_FIELD.fieldApiName] = this.selectedDescription;

            let recordInput = {
                apiName: ACCOUNT_OBJECT.objectApiName,
                fields : inputFields
            }
            
            createRecord(recordInput)
            .then((result) => {
                console.log("Account Created Successfully", result);
                let pageReference = {
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result.id,
                        objectApiName: ACCOUNT_OBJECT.objectApiName,
                        actionName: 'view'
                    }
                };
                this[NavigationMixin.Navigate](pageReference);
            })
            .catch((error) => {
                console.log("Error in creation", error);
            });

        } else{
            console.log("Inputs are not valid");
        }
    }

    validateInput(){
        let fields = Array.from(this.template.querySelectorAll(".validateMe"));

        let isValid = fields.every((currItem) => 
            currItem.checkValidity());
        return isValid;
    }
}