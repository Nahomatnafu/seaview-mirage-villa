import React from 'react'
import FaqPolicies from '../components/FaqPolicies'
import CtaBand from '../components/CtaBand'

export default function FaqPage() {
  return (
    <>
      <FaqPolicies />
      <CtaBand
        heading="Still have a question?"
        sub="Send your dates and anything you want to know — we reply within 24 hours."
        secondary={{ to: '/rates', label: 'View Rates' }}
      />
    </>
  )
}
