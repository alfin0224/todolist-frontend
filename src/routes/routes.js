import DashboardLayout from '../layout/DashboardLayout.vue'

import NotFound from '../pages/NotFoundPage.vue'

import Summary from 'src/pages/Summary.vue'
import TodoList from 'src/pages/TodoList.vue'

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/admin/summary'
  },
  {
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/summary',
    children: [
      {
        path: 'summary',
        name: 'Summary',
        component: Summary
      },

      {
        path: 'todo-list',
        name: 'Todo List',
        component: TodoList
      }
    ]
  },
  { path: '*', component: NotFound }
]

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes
