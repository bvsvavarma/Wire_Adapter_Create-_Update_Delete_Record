public with sharing class ToDoApexController {
    
    @AuraEnabled(cacheable=true) 
    public static List<Task_Manager__c> loadAllInCompleteTasks(){ 
        return [ 
        SELECT Id, Name, Task_Date__c  
        FROM Task_Manager__c  
        WHERE ownerId = :UserInfo.getUserId() 
        AND Is_Completed__c = false 
        WITH USER_MODE 
        ORDER BY Task_Date__c]; 
    }
    
    @AuraEnabled(cacheable=true) 
    public static List<Task_Manager__c> loadAllCompletedTasks(){ 
        return [ 
        SELECT Id, Name, Task_Date__c  
        FROM Task_Manager__c  
        WHERE ownerId = :UserInfo.getUserId() 
        AND Is_Completed__c = true 
        WITH USER_MODE 
        ORDER BY Completed_Date__c DESC]; 
    } 
}