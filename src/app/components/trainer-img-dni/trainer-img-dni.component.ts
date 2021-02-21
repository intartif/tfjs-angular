import { Component, OnInit, ViewChild } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
//import labels from './imagenet_labels.json';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';
import { Tensor, Tensor3D } from '@tensorflow/tfjs';


@Component({
  selector: 'app-trainer-img-dni',
  templateUrl: './trainer-img-dni.component.html',
  styleUrls: ['./trainer-img-dni.component.scss']
})
export class TrainerImgDniComponent implements OnInit {

  @ViewChild('webcam') videoElement: any;
  video: any;

  showWebcam = false;
  showWebcam2 = false;

  deviceId: string;

  errors: WebcamInitError[] = [];

  webcamImages: Array<any> = [];
  imagesCapture: Array<any> = [];
  labelImage: Array<any> = [];
  webcamImages2: Array<any> = [];
  /* imagesCapture2: Array<ImageData> = [];
  labelImage2: Array<String> = []; */

  private trigger: Subject<void> = new Subject<void>();
  private trigger2: Subject<void> = new Subject<void>();

  dniModel: tf.Sequential;
  prediction: any;

  NUM_DATASET_ELEMENTS = 0;
  NUM_TRAIN_ELEMENTS = 0;
  NUM_TEST_ELEMENTS: number; // NUM_TRAIN_ELEMENTS - this.NUM_DATASET_ELEMENTS;

  timeCountShot = 0;
  timeOutVar: any;
  timer = false;

  timeCountShot2 = 0;
  timeOutVar2: any;
  timer2 = false;

  timeBetweenSnapshot = 100; //ms

  camera_H = 480;
  camera_W = 640;

  constructor() { }

  ngOnInit(): void {
    //const shape = [2, 4];
    const inm = new Image();
    WebcamUtil.getAvailableVideoInputs();
  }

  async train() {

    this.createModel();

    this.dniModel.summary();
    const batchSize = 320;
    const validationSplit = 0.15;
    const trainEpochs = 100;
    let trainBatchCount = 0;
    let promise = Promise.resolve();
    /* const setLabel = Array.from(new Set(this.labelImage));
    const ys = tf.oneHot(tf.tensor1d(this.labelImage.map((a) => setLabel.findIndex(e => e === a)), 'int32'), 10); */

    const imagesTf = this.imagesCapture[0];

    const labelsTf = tf.oneHot(tf.tensor1d([0, 0, 0, 0]).toInt(), this.imagesCapture.length);
    console.log('originalImage:', imagesTf);

    for (let i = 1; i < this.imagesCapture.length; i++) {
      /* const labels = tf.tensor4d(this.labelImage[i]).expandDims(0);
      labelsTf.concat(labels); */

      const image = this.imagesCapture[i];
      imagesTf.concat(image);
    }
    //const labelsDataSet = ys.expandDims(0);
    console.log('Labels:', labelsTf);
    console.log('Images:', imagesTf);
    tf.tidy(() => {
      this.dniModel.fit(imagesTf, labelsTf, {
        batchSize,
        validationSplit,
        epochs: trainEpochs
      });
    });

    // const image = this.imagesCapture[0];

    tf.tidy(() => {

      const optimizer = tf.train.sgd(0.5);

      /* const testResult = this.createModel.evaluate(this.imagesCapture[0], tf.tensor1d([1])); */
      console.log('dniModel', this.dniModel);

      const p1 = this.loadImage('assets/perros.jpg');

      p1.then((resultado: Tensor3D) => {
        console.log('imageTest', resultado);
        const input = resultado;
          /* .resizeNearestNeighbor([this.camera_H, this.camera_W])
          .toFloat()
          .expandDims(0) */;
        /* .reshape([this.camera_H, this.camera_W, 4])
        .expandDims(0); */

        console.log('imageTestResize', input);
        const testResult = this.dniModel.predict(input);
        console.log('testResult', testResult);

        /* const labels = Array.from(ys.dataSync()); */
        console.log(testResult);

      });

    });

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
    this.loadImage(webcamImage.imageAsDataUrl).then(result => {

      this.imagesCapture.push(result);
      this.labelImage.push([0, 0, 0, 0]);
    });
    this.webcamImages.push(webcamImage.imageAsDataUrl);
  }

  public handleImage2(webcamImage: WebcamImage): void {
    this.loadImage(webcamImage.imageAsDataUrl).then(result => {
      this.imagesCapture.push(result);
      this.labelImage.push([1, 1, 1, 1]);
    });
    this.webcamImages2.push(webcamImage.imageAsDataUrl);

  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get triggerObservable2(): Observable<void> {
    return this.trigger2.asObservable();
  }

  public createModel() {
    this.dniModel = tf.sequential();

    this.dniModel.add(tf.layers.conv2d({
      inputShape: [this.camera_H, this.camera_W, 4], //RGB
      kernelSize: 3,
      filters: 32,
      strides: 3,
      activation: 'relu'
    }));

    //agrupación
    this.dniModel.add(tf.layers.maxPooling2d({
      poolSize: [2, 2]
    }));


    this.dniModel.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 64,
      activation: 'relu'
    }));

    this.dniModel.add(tf.layers.maxPooling2d({
      poolSize: [2, 2]
    }));

    this.dniModel.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 128,
      activation: 'relu'
    }));

    this.dniModel.add(tf.layers.flatten({
    }));

    //Capa de conexion
    this.dniModel.add(tf.layers.dense({
      units: 128,
      //inputDim: 2,
      //inputShape: [1, this.imagesCapture.length, 10],
      activation: 'relu'
    }));

    //Resultado binario
    this.dniModel.add(tf.layers.dense({
      inputShape: [4, this.imagesCapture.length],
      units: 10,
      activation: 'softmax'
    }));

    this.dniModel.compile({
      optimizer: tf.train.adam(0.0001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

  }

  convertURIToImageData(URI): Promise<ImageData> {
    return new Promise(function (resolve, reject) {
      if (URI == null) {
        return reject();
      }
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.addEventListener('load', function () {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(context.getImageData(0, 0, canvas.width, canvas.height));
      }, false);
      image.src = URI;
    });
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(tf.browser.fromPixels(img, 4)
        .resizeNearestNeighbor([this.camera_H, this.camera_W])
        .toFloat()
        .expandDims(0));
      img.onerror = (err) => reject(err);
    });
  }

  cropImage(img) {
    const width = img.shape[0];
    const height = img.shape[1];

    // use the shorter side as the size to which we will crop
    const shorterSide = Math.min(img.shape[0], img.shape[1]);

    // calculate beginning and ending crop points
    const startingHeight = (height - shorterSide) / 2;
    const startingWidth = (width - shorterSide) / 2;
    const endingHeight = startingHeight + shorterSide;
    const endingWidth = startingWidth + shorterSide;

    // return image data cropped to those points
    return img.slice([startingWidth, startingHeight, 0], [endingWidth, endingHeight, 3]);
  }

  resizeImage(image) {
    return tf.image.resizeBilinear(image, [224, 224]);
  }

  batchImage(image) {
    // Expand our tensor to have an additional dimension, whose size is 1
    const batchedImage = image.expandDims(0);

    // Turn pixel data into a float between -1 and 1.
    return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  }

  loadAndProcessImage(image) {
    const croppedImage = this.cropImage(image);
    const resizedImage = this.resizeImage(croppedImage);
    const batchedImage = this.batchImage(resizedImage);
    return batchedImage;
  }

  async loadMobilenet() {
    return await mobilenet.load();
  }

}
