import Steps from "../../components/forms/Steps";

export default function MainForm(){
    return (
        <>
            <div className="min-h-screen py-2 px-4">
                <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm lg:static lg:bg-transparent">
                    <Steps />
                </div>
            </div>
        </>
    )
}