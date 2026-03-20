import './../App.css'
export default function SlideTemplate({ title }) {
    return(
    <>
        <div className="templateClass">
            <div className="templateLayout">
                <div className="templateImage"></div>
                <div className="templateTitle">{title}</div>
            </div>
        </div>
    </>
    )
}
