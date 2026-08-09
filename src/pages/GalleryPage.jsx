import React from 'react'
import Gallery from '../components/Gallery'
import CtaBand from '../components/CtaBand'

export default function GalleryPage() {
  return (
    <>
      <Gallery />
      <CtaBand heading="Come see it in person" secondary={{ to: '/rates', label: 'View Rates' }} />
    </>
  )
}
