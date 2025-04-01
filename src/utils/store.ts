import { makeAutoObservable } from "mobx";
import { User } from "./models";

// Наше хранилище состояний(используем для работы с авторизацией на клиенте)
class Store {
  userData: User | undefined;
  authorized: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Получаем пользователя
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