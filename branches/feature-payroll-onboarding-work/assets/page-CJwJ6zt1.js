import{r as s,j as e,x as E,K as M,B as y,N as b,p as r}from"./index-BUxnDRJp.js";import{a as A}from"./DemoExample-CYOj-CAK.js";import{D as q}from"./DemoPage-D5QCUKrE.js";function J(){const[m,j]=s.useState(!1),[h,k]=s.useState("home"),g=s.useRef(null),f=s.useRef(null),I={name:"John Doe",email:"john.doe@example.com",avatarSrc:"",avatarAlt:"User Avatar"},[u,N]=s.useState(!1),[o,w]=s.useState({charts:!1,maps:!1,"map-2":!1}),[L,_]=s.useState(null),v=s.useRef(null),T={name:"Jane Smith",email:"jane.smith@example.com",avatarSrc:"",avatarAlt:"User Avatar"},C=s.useCallback(n=>{if(!n.detail){const t=v.current;if(!t)return;const a=t.closest(".layout-with-navbar");a&&(a.querySelectorAll(".side-nav-children-container").forEach(d=>{d.classList.add("side-nav-hidden"),d.setAttribute("aria-hidden","true")}),a.querySelectorAll(".side-nav-dropdown-toggle").forEach(d=>{d.getAttribute("name")==="expand_less"&&d.setAttribute("name","expand_more")}))}},[]),x=s.useCallback(()=>{console.log("Collapsing all sub-menus"),w({charts:!1,maps:!1,"map-2":!1})},[]),R=s.useCallback(n=>{console.log("Navbar main menu open change 1 - received:",n),j(n)},[]),D=s.useCallback(n=>{console.log("Navbar main menu open change 2 - received:",n),N(n),n||x()},[x]);s.useEffect(()=>{const n=g.current;n&&n.expanded!==m&&(n.expanded=m)},[m]),s.useEffect(()=>{const n=v.current;n&&n.expanded!==u&&(n.expanded=u)},[u]),s.useEffect(()=>{const n=g.current;if(!n)return;const t=a=>{const i=a.detail;console.log("Side navigation 1 expanded change:",i),j(d=>d!==i?i:d)};return n.addEventListener("expandedChange",t),()=>{n.removeEventListener("expandedChange",t)}},[]),s.useEffect(()=>{const n=v.current;if(!n)return;const t=a=>{const l=a,i=l.detail;console.log("Side navigation 2 expanded change:",i),N(d=>d!==i?(i||(x(),C(l)),i):d)};return n.addEventListener("expandedChange",t),()=>{n.removeEventListener("expandedChange",t)}},[x,C]),s.useEffect(()=>{const n=f.current;if(!n)return;const t=a=>{const i=a.detail?.value;i&&k(i)};return n.addEventListener("itemSelect",t),()=>{n.removeEventListener("itemSelect",t)}},[]),s.useEffect(()=>{const n=f.current;if(!n)return;n.querySelectorAll("modus-wc-menu-item").forEach(a=>{a.getAttribute("value")===h?a.setAttribute("selected",""):a.removeAttribute("selected")})},[h]);const S=(n,t)=>{t.stopPropagation(),console.log("Toggling sub-menu:",n),w(a=>({...a,[n]:!a[n]}))},c=n=>{console.log("Selected menu item:",n),_(n)},P=n=>{const t=n.currentTarget,a=t.closest("li");if(!a)return;const l=t.querySelector(".side-nav-dropdown-toggle");if(!l)return;const i=v.current,d=l.getAttribute("name")==="expand_more";i?.expanded&&l.setAttribute("name",d?"expand_less":"expand_more");const p=a.nextElementSibling;p&&p.classList.contains("side-nav-children-container")&&i?.expanded&&(p.classList.toggle("side-nav-hidden"),p.setAttribute("aria-hidden",d?"false":"true"))};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        .side-nav-children-container {
          transition: height 0.2s ease-out;
        }

        .side-nav-collapse-icon {
          min-width: 24px;
          padding-inline-start: 0.2rem;
        }

        .side-nav-dropdown-menu {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .side-nav-flex-row {
          align-items: center;
          display: flex;
          gap: 1.3rem;
          padding: 0.8rem 0.25rem;
          padding-left: 1rem;
          cursor: pointer;
        }

        .side-nav-hidden {
          display: none;
        }

        .side-nav-justify-end {
          margin-left: auto;
        }

        .layout-with-navbar {
          box-shadow: rgba(36, 35, 45, 0.3) 1px 0 4px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .main-content-row {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
          min-height: 500px;
        }

        .side-nav-menu-width {
          width: 100%;
        }

        .side-nav-nested-row {
          padding-left: 4.5rem !important;
        }

        .side-nav-deeply-nested-row {
          padding-left: 5.5rem !important;
        }

        .panel-content {
          flex: 1;
          padding: 1.5rem;
          overflow: auto;
          margin-left: 4rem; /* Account for collapsed side nav width */
        }

        .side-navigation {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          z-index: 999;
        }

        .modus-wc-menu ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .modus-wc-menu li ul {
          margin-inline-start: 1.8rem;
        }

        .side-nav-menu-item-container {
          list-style: none;
        }

        .side-nav-submenu-item {
          padding: 0.8rem 0.25rem;
          padding-left: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .side-nav-nested-submenu {
          margin-left: 1rem;
        }

        .side-nav-icon-left {
          flex-shrink: 0;
        }
      `}),e.jsxs(q,{title:"Modus Side Navigation",description:"A collapsible vertical navigation component that provides contextual menu options for application navigation. The component collapses to show icons only (4rem width) and expands to show full menu items with labels. Icons remain visible and properly positioned in both states.",children:[e.jsx(A,{title:"Navbar Integration (Recommended Pattern)",description:"Side navigation controlled by the navbar's main menu button (hamburger menu). This is the standard Modus pattern used in applications.",children:e.jsxs("div",{className:"layout-with-navbar h-[600px] flex flex-col","data-example":"basic",children:[e.jsx(E,{userCard:I,visibility:{mainMenu:!0,user:!0},onMainMenuOpenChange:R}),e.jsxs("div",{className:"main-content-row flex flex-1 overflow-hidden",children:[e.jsx(M,{ref:g,expanded:m,"collapse-on-click-outside":!0,"max-width":"256px",mode:"push","target-content":"#basic-panel-content",className:"side-navigation h-full",children:e.jsxs(y,{ref:f,size:"lg",children:[e.jsx(b,{label:"Home",value:"home",selected:!0,children:e.jsx(r,{slot:"start-icon",name:"home",decorative:!0})}),e.jsx(b,{label:"Profile",value:"profile",children:e.jsx(r,{slot:"start-icon",name:"person",decorative:!0})}),e.jsx(b,{label:"Settings",value:"settings",children:e.jsx(r,{slot:"start-icon",name:"settings",decorative:!0})})]})}),e.jsxs("div",{id:"basic-panel-content",className:"panel-content flex-1 p-6",children:[e.jsx("div",{className:"text-lg font-semibold text-foreground mb-4",children:"Main Content Area"}),e.jsx("div",{className:"text-base text-foreground mb-4",children:"The side navigation of an application provides context through accessible menu options and positions a consistent component to connect to various pages in the application."}),e.jsx("div",{className:"text-base text-foreground",children:`The side navigation is a collapsible side content of the site's pages. It is located alongside the page's primary content. The component is designed to add side content to a fullscreen application. It is activated through the "hamburger" menu in the Navbar.`}),e.jsxs("div",{className:"mt-4 p-4 rounded-lg bg-card border border-border",children:[e.jsx("div",{className:"text-sm font-medium text-card-foreground mb-1",children:"Navigation State:"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:m?"Expanded":"Collapsed"}),h&&e.jsxs("div",{className:"mt-2",children:[e.jsx("div",{className:"text-sm font-medium text-card-foreground mb-1",children:"Selected Item:"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:h})]})]})]})]})]})}),e.jsx(A,{title:"Side Navigation with Sub-Menus",description:"Advanced side navigation with collapsible sub-menus and nested menu items. Demonstrates hierarchical navigation with expand/collapse functionality.",children:e.jsxs("div",{className:"layout-with-navbar h-[700px] flex flex-col","data-example":"submenu",children:[e.jsx(E,{userCard:T,visibility:{mainMenu:!0,user:!0},onMainMenuOpenChange:D}),e.jsxs("div",{className:"main-content-row flex flex-1 overflow-hidden",children:[e.jsx(M,{ref:v,expanded:u,"collapse-on-click-outside":!0,"max-width":"256px",mode:"push","target-content":"#submenu-panel-content",className:"side-navigation h-full",children:e.jsxs(y,{"aria-label":"Custom menu","custom-class":"side-nav-menu-width",children:[e.jsx("li",{children:e.jsxs("div",{className:"side-nav-flex-row hover:bg-muted",onClick:P,children:[e.jsx(r,{name:"bar_graph",decorative:!0,className:"side-nav-collapse-icon side-nav-icon-left"}),e.jsx("div",{className:"side-nav-dropdown-menu",children:"Charts"}),e.jsx("div",{className:"side-nav-justify-end",children:e.jsx(r,{decorative:!0,name:"expand_more",className:"side-nav-collapse-icon side-nav-dropdown-toggle"})})]})}),e.jsx("li",{className:"side-nav-children-container side-nav-hidden","aria-hidden":"true",children:e.jsxs("ul",{children:[e.jsx("li",{children:e.jsx("div",{className:"side-nav-flex-row side-nav-nested-row hover:bg-muted",onClick:()=>c("bar-chart"),children:e.jsx("div",{children:"Bar Chart"})})}),e.jsx("li",{children:e.jsx("div",{className:"side-nav-flex-row side-nav-nested-row hover:bg-muted",onClick:()=>c("line-chart"),children:e.jsx("div",{children:"Line Chart"})})}),e.jsx("li",{children:e.jsx("div",{className:"side-nav-flex-row side-nav-nested-row hover:bg-muted",onClick:()=>c("pie-chart"),children:e.jsx("div",{children:"Pie Chart"})})})]})}),e.jsx("li",{children:e.jsxs("div",{className:"side-nav-flex-row hover:bg-muted",onClick:()=>c("calendar"),children:[e.jsx(r,{name:"calendar",decorative:!0,className:"side-nav-collapse-icon side-nav-icon-left"}),e.jsx("div",{className:"side-nav-dropdown-menu",children:"Calendar"})]})}),e.jsxs("div",{className:"side-nav-menu-item-container",children:[e.jsxs("div",{className:"side-nav-flex-row hover:bg-muted",onClick:n=>S("maps",n),children:[e.jsx(r,{name:"compass",decorative:!0,className:"side-nav-collapse-icon side-nav-icon-left"}),e.jsx("div",{className:"side-nav-dropdown-menu",children:"Maps"}),e.jsx("div",{className:"side-nav-justify-end",children:e.jsx(r,{name:o.maps?"expand_less":"expand_more",decorative:!0,className:"side-nav-collapse-icon side-nav-dropdown-toggle"})})]}),e.jsxs("div",{className:`side-nav-children-container ${o.maps?"":"side-nav-hidden"}`,"aria-hidden":!o.maps,children:[e.jsx("div",{className:"side-nav-submenu-item side-nav-nested-row hover:bg-muted",onClick:()=>c("map-1"),children:e.jsx("div",{children:"Map 1"})}),e.jsxs("div",{className:"side-nav-submenu-item side-nav-nested-row hover:bg-muted",onClick:n=>S("map-2",n),children:[e.jsx("div",{children:"Map 2"}),e.jsx("div",{className:"side-nav-justify-end",children:e.jsx(r,{name:o["map-2"]?"expand_less":"expand_more",decorative:!0,className:"side-nav-collapse-icon side-nav-dropdown-toggle"})})]}),e.jsxs("div",{className:`side-nav-children-container side-nav-nested-submenu ${o["map-2"]?"":"side-nav-hidden"}`,"aria-hidden":!o["map-2"],children:[e.jsx("div",{className:"side-nav-submenu-item side-nav-deeply-nested-row hover:bg-muted",onClick:()=>c("map-2-1"),children:e.jsx("div",{children:"Map 2-1"})}),e.jsx("div",{className:"side-nav-submenu-item side-nav-deeply-nested-row hover:bg-muted",onClick:()=>c("map-2-2"),children:e.jsx("div",{children:"Map 2-2"})})]}),e.jsx("div",{className:"side-nav-submenu-item side-nav-nested-row hover:bg-muted",onClick:()=>c("map-3"),children:e.jsx("div",{children:"Map 3"})})]})]})]})}),e.jsxs("div",{id:"submenu-panel-content",className:"panel-content flex-1 p-6",children:[e.jsx("div",{className:"text-lg font-semibold text-foreground mb-4",children:"Sub-Menu Navigation"}),e.jsx("div",{className:"text-base text-foreground mb-4",children:"This example demonstrates hierarchical navigation with collapsible sub-menus. Click on menu items with arrows to expand/collapse sub-menus. The navigation maintains state and properly handles nested menu structures."}),e.jsxs("div",{className:"mt-4 p-4 rounded-lg bg-card border border-border",children:[e.jsx("div",{className:"text-sm font-medium text-card-foreground mb-2",children:"Current Selection:"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:L||"No item selected"})]}),e.jsxs("div",{className:"mt-4 p-4 rounded-lg bg-muted",children:[e.jsx("div",{className:"text-sm font-medium text-foreground mb-2",children:"Sub-Menu States:"}),e.jsxs("div",{className:"text-xs text-muted-foreground",children:[e.jsxs("div",{children:["Charts:"," ",o.charts?"Expanded":"Collapsed"]}),e.jsxs("div",{children:["Maps: ",o.maps?"Expanded":"Collapsed"]}),e.jsxs("div",{children:["Map 2: ",o["map-2"]?"Expanded":"Collapsed"]})]})]}),e.jsxs("div",{className:"mt-4 p-4 rounded-lg bg-card border border-border",children:[e.jsx("div",{className:"text-sm font-medium text-card-foreground mb-1",children:"Navigation State:"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:u?"Expanded":"Collapsed"})]})]})]})]})})]})]})}export{J as default};
