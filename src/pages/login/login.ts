import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AngularFireAuth } from 'angularfire2/auth';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public email;
  public password;

  constructor(public navCtrl: NavController, public navParams: NavParams, public afAuth: AngularFireAuth, private storage: Storage) {
    storage.get('userLogin').then((val) => {
      if(val){
        this.navCtrl.setRoot(HomePage);
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  login(){
    if(this.email != "" && this.password != ""){
      this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password).then((newUser) => {
        if(newUser != null){
          this.storage.set('userLogin', true);
          this.storage.set('userId', newUser.user.uid);
          this.navCtrl.setRoot(HomePage);
        }  else{
          this.storage.set('userLogin', false);
        }    
    });
    }
  }
}
