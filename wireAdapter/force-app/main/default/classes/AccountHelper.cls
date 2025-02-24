public with sharing class AccountHelper {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountData(){
       return [
                SELECT Id, Name, Industry, Rating 
                FROM Account 
                WITH USER_MODE
            ];
    } 

    @AuraEnabled(cacheable=true) //When ever we are using wire methoed cacheable must be true
    public static List<Account> getParentAccounts(){
        return [
            SELECT Id, Name, Industry
            FROM Account 
            WHERE AnnualRevenue != null
            WITH USER_MODE
        ];
    }
}