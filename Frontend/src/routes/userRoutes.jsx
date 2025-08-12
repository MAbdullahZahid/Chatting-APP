  import Dashboard from '../views/Dashboard'
  
  const userRoutes = [
     {
         path: "/dashboard",
         name: "Dashboard",
         component: <Dashboard />,
         layout: "/user",
       },
   
  ]
  export default userRoutes;