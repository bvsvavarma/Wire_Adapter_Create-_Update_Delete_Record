import { LightningElement, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import TASK_MANAGER_OBJECT from '@salesforce/schema/Task_Manager__c';
import TASK_NAME_FIELD from '@salesforce/schema/Task_Manager__c.Name';
import TASK_DATE_FIELD from '@salesforce/schema/Task_Manager__c.Task_Date__c';
import TASK_COMPLETED_DATE_FIELD from '@salesforce/schema/Task_Manager__c.Completed_Date__c';
import TASK_IS_COMPLETED_FIELD from '@salesforce/schema/Task_Manager__c.Is_Completed__c';
import loadAllInCompleteTasks from '@salesforce/apex/ToDoApexController.loadAllInCompleteTasks';
import loadAllCompletedTasks from '@salesforce/apex/ToDoApexController.loadAllCompletedTasks';

export default class ToDoManager extends LightningElement {
    selTaskName;
    selTaskDate = null;
    incompleteTask = [];
    completeTask = [];
    error;

    @wire(loadAllInCompleteTasks) wired_loadAllInCompleteTasks({data, error}){
        if(data){
            console.log('Incomplete Tasks: ', data);
            this.incompleteTask = data.map((currItem) => ({
                taskId : currItem.Id,
                taskName: currItem.Name,
                taskDate: currItem.Task_Date__c
            }));
            console.log('Incomplete Task Array: ', this.incompleteTask);
        } else if(error){
            console.log('Error while getting Incomplete Tasks', error);
        }
    } 

    @wire(loadAllCompletedTasks) wired_loadAllCompleteTasks({data, error}){
        if(data){
            console.log('Complete Task Record: ', data);
            this.completeTask = data.map((currItem) => ({
                taskId : currItem.Id,
                taskName: currItem.Name,
                taskDate: currItem.Task_Date__c,
            }));
            console.log("Complete Task Array", this.completeTask);
        }else if(error){
            console.log("Error while creating Complete Task", error);
        }
    } 
    changeHandler(event){
        let {name, value} = event.target;
        if(name === 'taskName'){
            this.selTaskName = value;
        } else if (name === 'taskDate'){
            this.selTaskDate = value;
        }
    }

    resetHandler(){
        this.selTaskName = "";
        this.selTaskDate = null;
    }

    addTaskHandler(){
        //If task end date is missing, then populate todays date as end date
        if(!this.selTaskDate){
            this.selTaskDate = new Date().toISOString().slice(0, 10);
        }

        let inputFields = {};
        inputFields[TASK_NAME_FIELD.fieldApiName] = this.selTaskName;
        inputFields[TASK_DATE_FIELD.fieldApiName] = this.selTaskDate;
        inputFields[TASK_IS_COMPLETED_FIELD.fieldApiName] = false;
        
        let recordInput = {
            apiName: TASK_MANAGER_OBJECT.objectApiName, 
            fields : inputFields
        };
        
        createRecord(recordInput).then((result) => {
            console.log('Record Created Successfully', result);
            this.showToast('Success', 'Task Created successfully', 'success');
            this.resetHandler();
        }).catch((error) => {
            console.log('Error while creating record', error);
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title : title,
            message : message,
            variation : variant
        });
        this.dispatchEvent(event);
    }
}