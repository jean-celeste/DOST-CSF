import { Metadata } from "next";
import ConsentForm from "../components/DataPrivacyConsentForm";
export default function Home(){
  return(
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        {<ConsentForm />}
      </div>
    </>
  )
}