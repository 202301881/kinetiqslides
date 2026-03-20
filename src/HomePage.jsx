import './App.css'
import { Home, File, Cog, ChevronDown } from 'lucide-react'
import  SlideTemplate  from './Components/SlideTemplate';
function HomePage() {
  return(
    <>
      <div className="figureContent">
        <div className="sideBar">
          <div className="appName">ClassPoint Studio</div>
          <div className="sideArea">
            <div className="sideContent" id="home">
              <span className="sideIcon">
                <Home size={24}></Home>
              </span>
              Home
            </div>
            <div className="sideContent" id="fil">
              <span className="sideIcon">
                <File size={24}></File>
              </span>
              Files
            </div>
            <div className="sideContent" id="settings">
              <span className="sideIcon">
                <Cog size={24}></Cog>
              </span>
              Settings
            </div>
          </div>
        </div>
        <div className="mainContent">
          <div className="greetings">Good Morning</div>
            <div className="templates">
              <div className="templateCollapse">
                <span className="templateDownIcon">
                  <ChevronDown color="rgb(20, 20, 20)"></ChevronDown>
                </span>
                New
              </div>
              <div className="templateList">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SlideTemplate title="Blank Presentation" />
                ))}
              </div>
            </div>
            <div className="recentFiles">
              
            </div>
        </div>
      </div>
    </>
  )
}
export default HomePage;
