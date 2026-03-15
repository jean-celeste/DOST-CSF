import Steps from "../../components/forms/Steps";

export default function MainForm(){
    return (
        <>
            <div className="flex flex-row space-between justify-start min-h-screen py-2 px-4">
                {/*Steps */}
                    <div className="flex flex-col items-center justify-center lg-center w-1/3">
                        <Steps />
                    </div>
                    <div className="flex flex-col items-center justify-center w-1/3">
                        <Steps/>
                    </div>
                    <div className="flex flex-col items-center justify-center w-1/3">
                        <Steps/>
                    </div>
            </div>
        </>
    )
}