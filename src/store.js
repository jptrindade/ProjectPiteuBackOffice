import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    userId : localStorage.getItem('userId') || "",
    userEmail : localStorage.getItem('userEmail') || "",
    editRecipeId : null,
    externalRecipe : null,
    currentRecipe: null
  },
  mutations: {
    auth_request(state){
        state.status = 'loading'
    },
    auth_success(state, token, userId, userEmail){
        state.status = 'success'
        state.token = token
        state.userId = userId
        state.userEmail = userEmail
    },
    auth_error(state){
        state.status = 'error'
    },
    logout(state){
        state.status = ''
        state.token = ''
        state.userId = ''
        state.userEmail = ''
    },
    editRecipe(state, recipeId){
      state.editRecipeId = recipeId
    },
    newExternalRecipe(state, recipe){
      state.externalRecipe = recipe
    }, 
    updateCurrentRecipe(state, recipe){
      state.currentRecipe = recipe
    }
  },
  actions: {
    logout({commit}){
      return new Promise((resolve) => {
        commit('logout')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        resolve()
      })
    },
    login({commit}, user){
        return new Promise((resolve, reject) => {
          commit('auth_request')
          user["username"]=user["email"]
          axios({url: process.env.VUE_APP_DATABASE+'login/', data: user, method: 'POST' })
          .then(resp => {
            console.log(resp)
            let token = resp.data["token"]
            const userEmail = resp.data.userEmail
            const userId = resp.data.userId
            if(resp.data.isUserAdmin == false || !token){
              reject('Unauthorized')
              return
            }
            localStorage.setItem('token', token)
            localStorage.setItem('userEmail', userEmail)
            localStorage.setItem('userId', userId)
            console.log(localStorage.getItem('token'))
            console.log(token)
            axios.defaults.headers.common['Authorization'] = token
            commit('auth_success', token, userId, userEmail)
            resolve(resp)
          })
          .catch(err => {
            commit('auth_error')
            localStorage.removeItem('token')
            reject(err)
          })
        })
    },

  },
  getters : {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    getRecipeToEdit: state => state.editRecipeId,
    getToken: state => state.token,
    getUserEmail: state => state.userEmail,
    getUserId: state => state.userId,
    getTokenToSend: state => {return "Token "+state.token},
    getExternalRecipe: state => state.externalRecipe,
    getCurrentRecipe: state => state.currentRecipe
  }
})