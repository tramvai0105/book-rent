import { makeAutoObservable } from "mobx";

class Store {
  userData: any
  authorized: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUser(){
    let res = await fetch("/auth/me")
    let body = await res.json();
    if(body.message !== 'Unauthorized'){
        this.setUserData(body.user);
        this.setAuthorized(true);
    }else{
      this.setUserData(null);
      this.setAuthorized(false);
    }
  }

  setUserData(data: any){
    this.userData = data;
  }

  getUserData(){
    return this.userData;
  }

  getAuthorized(){
   return this.authorized
  }

  setAuthorized(authorized: boolean){
    this.authorized = authorized;
  }
}

const store = new Store();
export default store;