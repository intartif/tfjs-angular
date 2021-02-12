import { Component, OnInit, ViewChild } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';


@Component({
  selector: 'app-trainer-img-dni',
  templateUrl: './trainer-img-dni.component.html',
  styleUrls: ['./trainer-img-dni.component.scss']
})
export class TrainerImgDniComponent implements OnInit {

  @ViewChild('webcam') videoElement: any;
  video: any;

  public showWebcam = true;
  public showWebcam2 = true;

  public deviceId: string;

  public errors: WebcamInitError[] = [];

  public webcamImages: Array<WebcamImage> = [];
  public webcamImages2: Array<WebcamImage> = [];

  private trigger: Subject<void> = new Subject<void>();
  private trigger2: Subject<void> = new Subject<void>();

  dniModel: tf.Sequential;
  prediction: any;

  timeCountShot = 0;
  timeOutVar: any;
  timer = false;

  timeCountShot2 = 0;
  timeOutVar2: any;
  timer2 = false;

  timeBetweenSnapshot = 100; //ms

  constructor() { }

  ngOnInit(): void {
    const a = tf.tensor3d([1, 2, 3, 4], [2, 2, 1]);
    console.log('shape:', a.shape);

    WebcamUtil.getAvailableVideoInputs();
  }

  async train() {

  }

  predict(value) {

  }

  public triggerSnapshot(): void {
    if (this.timer) {
      this.startTimer();
    }

    if (!this.timer) {
      this.stopTimer();
    }
  }

  public triggerSnapshot2(): void {
    if (this.timer2) {
      this.startTimer2();
    }

    if (!this.timer2) {
      this.stopTimer2();
    }
  }

  async startTimer() {
    this.timeOutVar = setTimeout(() => {
      this.trigger.next();
      if (this.timer) {
        this.triggerSnapshot();
      }
    }, this.timeBetweenSnapshot)
  }

  async startTimer2() {
    this.timeOutVar2 = setTimeout(() => {
      this.trigger2.next();
      if (this.timer2) {
        this.triggerSnapshot2();
      }
    }, this.timeBetweenSnapshot)
  }

  public stopTimer() {
    clearTimeout(this.timeOutVar);
    /* this.video.pause(); */
  }

  public stopTimer2() {
    clearTimeout(this.timeOutVar2);
    /* this.video.pause(); */
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImages.push(webcamImage);
  }

  public handleImage2(webcamImage: WebcamImage): void {
    this.webcamImages2.push(webcamImage);
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get triggerObservable2(): Observable<void> {
    return this.trigger2.asObservable();
  }

}
