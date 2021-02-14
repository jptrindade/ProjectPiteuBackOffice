<template>
  <sidebar-menu :menu="menu" :show-one-child="true" 
        @toggle-collapse="onToggleCollapse" :collapsed="componentCollapsed">
    <span slot="toggle-icon" class="fa fa-arrows-h"></span>
    <span slot="dropdown-icon" class="fa fa-angle-right"></span>
  </sidebar-menu>
</template>
 
<script>
import { SidebarMenu } from 'vue-sidebar-menu'

  export default {    
  components: {
    SidebarMenu
  },
  methods : {
    onToggleCollapse (componentCollapsed) {
      this.componentCollapsed = componentCollapsed
      this.setCollapsed(this.componentCollapsed)
    },
  },
  props: ['collapsed','set-collapsed'],
  data() {
      return {
          componentCollapsed : this.collapsed,
          menu: [
              {
                  header: true,
                  title: 'Main Navigation',
                  hiddenOnCollapse: true
              },
              {
                  href: '/',
                  title: 'Home',
                  icon: 'fa fa-home'
              }, 
              {
                  href: '/recipes',
                  title: 'Recipes',
                  icon: 'fa fa-book',
                  child: [
                      {
                          href: '/validateRecipe',
                          title: 'Validate Recipe',
                          icon: 'fa fa-check',
                      },
                      {
                          href: '/addRecipe',
                          title: 'Add Recipe',
                          icon: 'fa fa-plus',
                      },
                      {
                          href: '/fanarRecipe',
                          title: 'Fanar Recipe',
                          icon: 'fa fa-exclamation-triangle',
                      }
                  ]
              },
              {
                  href: '/ingredients',
                  title: 'Ingredients',
                  icon: 'fa fa-apple',
                  child: [
                      {
                          href: '/validateIngredient',
                          title: 'Validate Ingredient',
                          icon: 'fa fa-check',
                      },
                      {
                          href: '/addIngredient',
                          title: 'Add Ingredient',
                          icon: 'fa fa-plus',
                      }
                  ]
              },
              {
                  href: '/diets',
                  title: 'Diets',
                  icon: 'fa fa-filter'
              },
              {
                  href: '/stats',
                  title: 'Stats',
                  icon: 'fa fa-stethoscope'
              }, 
              {
                  href: '/exportData',
                  title: 'Export Data',
                  icon: 'fa fa-database'
              },
          ]
      }
  }
}
</script> 