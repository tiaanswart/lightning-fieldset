/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-05-18
 * @description  FieldsetControllerTest
 * 
 * CHANGE LOG
 * 2019-05-18 - Initial Setup of FieldsetControllerTest
 **/
@IsTest
private class FieldsetControllerTest {

    @IsTest
    static void testMetadata() {

        Account testAccount = new Account(Name='Test Account');
        insert testAccount;

        Contact testContact = new Contact(FirstName='Test', LastName='Name', AccountId=testAccount.Id);
        insert testContact;

        FieldsetController.MetadataResponse resp = FieldsetController.getObjectMetadata(testAccount.Id);
        System.assertEquals('Account', resp.sObjectName, 'Expected the correct SObject Type to be returned');

        resp = FieldsetController.getObjectMetadata(testContact.Id);
        System.assertEquals('Contact', resp.sObjectName, 'Expected the correct SObject Type to be returned');

        resp = FieldsetController.getFieldSetMetadata(testAccount.Id, 'Name');
        System.assertEquals('Account', resp.sObjectName, 'Expected the correct SObject Type to be returned');
        System.assertNotEquals(null, resp.fieldSetLabel, 'Expected to have a field set name');
        System.assertNotEquals(true, resp.fieldsMetadata.isEmpty(), 'Expected to have fields for the field set');

        resp = FieldsetController.getFieldSetMetadata(testContact.Id, 'Name');
        System.assertEquals('Contact', resp.sObjectName, 'Expected the correct SObject Type to be returned');
        System.assertNotEquals(null, resp.fieldSetLabel, 'Expected to have a field set name');
        System.assertNotEquals(true, resp.fieldsMetadata.isEmpty(), 'Expected to have fields for the field set');

        try {
            resp = FieldsetController.getFieldSetMetadata(null, null);
            System.assertEquals(true, false, 'Expected the test not to continue');
        } catch (AuraHandledException ex) {
            System.assertEquals(true, true, 'Expected the test to encounter an AuraHandledException');
        }

        try {
            resp = FieldsetController.getFieldSetMetadata(testAccount.Id, null);
            System.assertEquals(true, false, 'Expected the test not to continue');
        } catch (AuraHandledException ex) {
            System.assertEquals(true, true, 'Expected the test to encounter an AuraHandledException');
        }

        try {
            resp = FieldsetController.getFieldSetMetadata(testAccount.Id, 'FakeFieldSetNameForTest');
            System.assertEquals(true, false, 'Expected the test not to continue');
        } catch (AuraHandledException ex) {
            System.assertEquals(true, true, 'Expected the test to encounter an AuraHandledException');
        }

    }

}