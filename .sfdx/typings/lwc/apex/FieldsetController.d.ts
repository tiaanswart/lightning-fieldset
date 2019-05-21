declare module "@salesforce/apex/FieldsetController.getObjectMetadata" {
  export default function getObjectMetadata(param: {recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/FieldsetController.getFieldSetMetadata" {
  export default function getFieldSetMetadata(param: {recordId: any, fieldSetName: any}): Promise<any>;
}
