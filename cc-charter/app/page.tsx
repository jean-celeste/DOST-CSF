import { Metadata } from "next";
import ConsentForm from "../components/DataPrivacyConsentForm";
export default function Home(){
  return(
    <>
      <div className="flex flex-col items-center justify-center min-h-80 py-2">
        {<ConsentForm />}
      </div>
    </>
  )
}