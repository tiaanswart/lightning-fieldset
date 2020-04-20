/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-05-18
 * @description  fieldset
 *
 * CHANGE LOG
 * 2019-05-18 - Initial Setup of fieldset
 **/
import {
    LightningElement,
    api,
    wire,
    track
} from 'lwc';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import getFieldSetMetadata from '@salesforce/apex/FieldsetController.getFieldSetMetadata';

export default class Fieldset extends LightningElement {

    // Config
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
    @api recordTypeId;

    // Record props
    @track sObjectName;
    @track recordFields = [];
    @track metadataError;

    // Track changes to our main properties that will need to be binded to HTML
    @track isLoading = true;
    @track isEditing = false;
    @track hasChanged = false;
    @track isSaving = false;
    @track layoutSizeLarge;
    @track layoutSizeMedium;
    @track layoutSizeSmall;

    // Web Component Init
    connectedCallback() {
        // Setup the layout sizes
        if (this.columnsLarge) this.layoutSizeLarge = 12 / this.columnsLarge;
        if (this.columnsMedium) this.layoutSizeMedium = 12 / this.columnsMedium;
        if (this.columnsSmall) this.layoutSizeSmall = 12 / this.columnsSmall;
        // Handle always editing state
        if (this.alwaysEditing) this.isEditing = true;
    }

    // Get the SObjectType and the Fields
    @wire(getFieldSetMetadata, {
        recordId: '$recordId',
        fieldSetName: '$fieldSetName'
    })
    wiredFieldSetMetadata({
        error,
        data
    }) {
        this.isLoading = true;
        if (data) {
            // Get the FieldSet Name if we have no custom title
            if (!this.strTitle) this.strTitle = data.fieldSetLabel;
            // Get the Record Type Id
            this.recordTypeId = data.recordTypeId;
            // Get the SObject Name
            this.sObjectName = data.sObjectName;
            // If we have record fields, Remove them all
            if (!!this.recordFields.length)
                while (this.recordFields.length > 0) this.recordFields.pop();
            // Get the fields metadata and populate fields
            data.fieldsMetadata.forEach((fd) => {
                // Get valid JSON
                const fieldProperties = JSON.parse(fd);
                const {
                    fieldSetProperties,
                    fieldDescribeProperties
                } = fieldProperties;
                // Add the field
                this.recordFields.push({
                    name: fieldDescribeProperties.name,
                    isRequired: fieldSetProperties.isRequired || fieldSetProperties.dbRequired,
                    isUpdateable: !!fieldDescribeProperties.updateable,
                    editable: this.isEditing && !!fieldDescribeProperties.updateable
                });
            });
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
        }
        if (this.recordFields.length || this.metadataError) this.isLoading = false;
    }

    // Get the card Title if we should show it
    get cardTitle() {
        return this.showTitle ? this.strTitle : null;
    }

    // Show spinner error property
    get showSpinner() {
        return this.isLoading || this.isSaving;
    }

    // Show the record form
    get showForm() {
        return !this.isLoading && !!this.sObjectName && !this.metadataError;
    }

    // Check if we can edit
    get editLabel() {
        return this.isEditing ? 'Cancel' : 'Edit';
    }

    // Check if we can edit
    get canEdit() {
        return this.isEditable && !this.alwaysEditing && !!this.recordFields.length;
    }

    // Check if we can save, we need fields
    get canSave() {
        return (this.canEdit || this.alwaysEditing) && this.isEditing && this.hasChanged && !!this.recordFields.length;
    }

    // Show a UI Message
    showToastEvent(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    // Toggle editable state
    toggleEdit() {
        if (this.canEdit) this.isEditing = !this.isEditing;
        this.recordFields.forEach((field) => {
            field.editable = this.isEditing && field.isUpdateable;
        });
    }

    // Set the has changed to true
    setHasChanged() {
        this.hasChanged = true;
    }

    // Handle the form Submit callback
    handleFormSubmit() {
        // Show spinner
        this.isSaving = true;
    };

    // Handle the form Success callback
    handleFormSuccess() {
        // Hide spinner
        this.isSaving = false;
        // No more changes to save
        this.hasChanged = false;
        // Show success message
        this.showToastEvent(this.saveMessageTitle, this.saveMessage, 'success');
        // Remove editable state
        this.toggleEdit();
    };

    // Handle the form Error callback
    handleFormError() {
        // Hide spinner
        this.isSaving = false;
    };
}