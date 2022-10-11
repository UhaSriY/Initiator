import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';

const SERVER_URL = 'http://localhost:3040/project/uploadfile'; //need to change this to connect to backend-api

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  myControl = new FormControl();
  fileObject: any;
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  response: string;
  presentFileArray: string[] = [];
  showProcessBar = false;
  uploadForm: FormGroup;
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient
  ) {
    this.uploader = new FileUploader({
      url: SERVER_URL,
      itemAlias: 'researchCoordinatorFile',
      additionalParameter: {
        research_coordinator_id: '1',
        description: 'testing research coordinator file upload',
      },
      // allowedMimeType: ['application/gzip']
    });

    this.uploader.onSuccessItem = (item) => {
      console.log('upload success');
      console.log(item.file.name);
      this.presentFileArray.push(item.file.name);
      this.showProcessBar = true;
    };

    this.uploader.onBeforeUploadItem = (item) => {
      this.showProcessBar = false;
      this.response = '';
      item.withCredentials = false;
    };

    this.uploader.onAfterAddingFile = (file) => {
      //create my name
      file.file.name = Date.now() + file.file.name;
      console.log(file.file.name);
      // this.presentFileArray.push(file.file.name);
    };

    this.uploader.onCompleteItem = (item: any, status: any) => {};

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

    this.response = '';

    this.uploader.response.subscribe((res) => {
      this.response = res;
      console.log(res);
    });
  }

  ngOnInit(): void {}
}
