<template>
<div id="app">
  <v-app id="inspire">
    <h1>Welcome to Project Piteu Backoffice</h1>
    <v-app id="inspire">
      <v-main>
        <v-container
          fluid
        >
          <v-row
            align="center"
            justify="center"
          >
            <v-col
              cols="12"
              sm="8"
              md="4"
            >
              <v-card class="elevation-12">
                <v-toolbar
                  color="#fdc718"
                  dark
                  flat
                >
                  <v-toolbar-title>Login</v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
                <v-card-text>
                  <v-form>
                    <v-text-field
                      label="Email"
                      v-model="email"
                      prepend-icon="mdi-account"
                      type="text"
                    ></v-text-field>
  
                    <v-text-field
                      id="password"
                      label="Password"
                      v-model="password"
                      prepend-icon="mdi-lock"
                      type="password"
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="login">Login</v-btn>
                </v-card-actions>
              <p v-if="err">{{err}}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </v-app>
</div>

</template>
<script>
  export default {
    data(){
      return {
        email : "",
        password : "",
        err : null
      }
    }, 
    methods: {
      appendScript(script){
        let recaptchaScript = document.createElement('script')
        recaptchaScript.setAttribute('src', script)
        document.head.this.appendChild(recaptchaScript)    
      }
      ,
      login: function () {
        let email = this.email 
        let password = this.password
        this.$store.dispatch('login', { email, password })
       .then(() => this.$router.push('/'))
       .catch(
         err => {
           console.log(err)
            this.err=err
          }
       )
      }
    },
  }
</script>