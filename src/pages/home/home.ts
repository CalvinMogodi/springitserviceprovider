import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  imgURL = '';
  public thereIsAvailableRequest = false;
  public userId = 0;
  public showRequest = false;
  public availableRequest = {
    id: '',
    carType: '',
    date: '',
    time: '',
    location: '',
    createdDate: new Date(),
    userId: 0,
    active: false,
    pickedup: false,
    phonenumber: 0
  };
  public timeInSeconds = 30;
  public time = this.timeInSeconds;
  public runTimer = false;
  public hasStarted = false;
  public hasFinished = false;
  public remainingTime = this.timeInSeconds;
  public displayTime = '0';

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, public zone: NgZone, private storage: Storage) {
    storage.get('userId').then((val) => {
      this.userId = val;
      this.db.database.ref().child('serviceproviders/' + val).on('value', snapshot => {
        var user = snapshot.val();
      if(user.busy){
        this.thereIsAvailableRequest = false;
      }else{
        this.db.database.ref().child('requests').on('value', snapshot => {
          var result = snapshot.val();
          if (result != null) {
            snapshot.forEach(snap => {
              var request = snap.val();
              if (!request.pickedup && !this.thereIsAvailableRequest) {
                this.availableRequest = request;
                this.thereIsAvailableRequest = true;
                this.availableRequest.id = snap.key;
                switch (this.availableRequest.carType) {
                  case 'Bakkie':
                    this.imgURL = '../../assets/imgs/bakkie.png';
                    break;
                  case 'Hatchback':
                    this.imgURL = '../../assets/imgs/hatchback.png';
                    break;
                  case 'Sedan':
                    this.imgURL = '../../assets/imgs/sedan.png';
                    break;
                  case 'SUV':
                    this.imgURL = '../../assets/imgs/suv.png';
                    break;
                  case 'Kombie':
                    this.imgURL = '../../assets/imgs/kombie.png';
                    break;
                }
                this.initTimer();
                this.startTimer();
              }
            });
          }
        });
      }
    });
  });    
  }

  accept() {
    var updates = {};
    updates['requests/'+this.availableRequest.id+'/pickedup/'] = true;
    updates['requests/'+this.availableRequest.id+'/userId/'] = this.userId;    
    this.db.database.ref().update(updates);
    this.thereIsAvailableRequest = false;
    this.showRequest = true;
  }

  close(){
    this.thereIsAvailableRequest = false;
    this.showRequest = false;
  }


  initTimer() {
    // Pomodoro is usually for 25 minutes
    if (!this.timeInSeconds) {
      this.timeInSeconds = 1500;
    }

    this.time = this.timeInSeconds;
    this.runTimer = false;
    this.hasStarted = false;
    this.hasFinished = false;
    this.remainingTime = this.timeInSeconds;

    this.displayTime = this.getSecondsAsDigitalClock(this.remainingTime);
  }

  startTimer() {
    this.runTimer = true;
    this.hasStarted = true;
    this.timerTick();
  }

  pauseTimer() {
    this.runTimer = false;
  }

  resumeTimer() {
    this.startTimer();
  }

  timerTick() {
    setTimeout(() => {

      if (!this.runTimer) { return; }
      this.remainingTime--;
      this.zone.run(() => {
        this.displayTime = this.getSecondsAsDigitalClock(this.remainingTime);
      });

      if (this.remainingTime > 0) {
        this.timerTick();
      }
      else {
        this.zone.run(() => {
          this.hasFinished = true;
          this.thereIsAvailableRequest = false;
        });
      }
    }, 1000);
  }

  getSecondsAsDigitalClock(inputSeconds: number) {
    var sec_num = parseInt(inputSeconds.toString(), 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var secondsString = '';
    secondsString = (seconds < 10) ? "0" + seconds : seconds.toString();
    return secondsString;
  }

}
