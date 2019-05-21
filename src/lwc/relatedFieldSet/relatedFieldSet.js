/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-05-18
 * @description  fieldset
 *
 * CHANGE LOG
 * 2019-05-18 - Initial Setup of relatedFieldSet
 **/
import { LightningElement, api, wire, track } from 'lwc';
import getObjectMetadata from '@salesforce/apex/FieldsetController.getObjectMetadata';

export default class Fieldset extends LightningElement {

    // Config
    @api relatedField;
    @api showTitle;
    @api strTitle;
    @api iconName;
    @api columnsLarge;
    @api columnsMedium;
    @api columnsSmall;
    @api fieldSetName;
    @api isEditable;
    @api alwaysEditing;
    @api saveMessageTitle;
    @api saveMessage;
    @api recordId;
    @api relatedRecordId;

    // Record props
    @track sObjectName;
    @track metadataError;

    // Track changes to our main properties that will need to be binded to HTML
    @track isLoading = true;

    // Get the SObjectType and the Fields
    @wire(getObjectMetadata, { recordId: '$recordId' })
    wiredObjectMetadata({ error, data }) {
        this.isLoading = true;
        if (data) {
            // Get the SObject Name
            this.sObjectName = data.sObjectName;
            // Clear any errors
            this.metadataError = undefined;
        } else if (error) {
            this.metadataError = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.metadataError = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.metadataError = error.body.message;
            }
            console.error('getMetadata error', this.metadataError);
            this.isLoading = false;
        }
    }

    // Show the record form
    get showForm() {
        return !!this.sObjectName && !this.metadataError;
    }

    // Show the record form
    get showRelatedFieldSet() {
        return !this.isLoading && !!this.sObjectName && !this.metadataError && !!this.relatedRecordId;
    }

    // Handle the form Load callback
    handleFormLoad(evt) {
        // Stop the spinner
        this.isLoading = false;
        // Get the data from the Record UI API
        const relatedRecordId = evt.detail.records[this.recordId].fields[this.relatedField].value;
        // Prevent the form from reloading every time we assign a value
        if (relatedRecordId !== this.relatedRecordId) this.relatedRecordId = relatedRecordId;
    };
}