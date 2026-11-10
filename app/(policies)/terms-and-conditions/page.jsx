'use client'

import React from 'react'

export default function TermsAndConditions() {
  return (
    <div>
      <h1 className='text-xl lg:text-4xl font-black  mb-3'>GADGET RESTORE TERMS & CONDITIONS</h1>
      <div className='flex flex-wrap gap-x-6 gap-y-2 text-xs mb-10' style={{ color: 'var(--color-content-text-secondary)' }}>
        <p>Effective Date: June 25, 2026</p>
        <p>•</p>
        <p>Last Updated: June 25, 2026</p>
      </div>

      <div className='space-y-8 text-sm leading-relaxed' style={{ color: 'var(--color-content-text)' }}>
        {/* Company & Support Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border text-xs mb-8' style={{ background: 'var(--color-content-card)', borderColor: 'var(--color-content-border)' }}>
          <div>
            <p className='font-semibold mb-1' style={{ color: 'var(--color-content-text)' }}>Operated by</p>
            <p className='mb-3' style={{ color: 'var(--color-content-text-secondary)' }}>Radical Aftermarket Private Limited<br />(trading as Gadget Restore)</p>

            <p className='font-semibold mb-1' style={{ color: 'var(--color-content-text)' }}>CIN</p>
            <p className='mb-3' style={{ color: 'var(--color-content-text-secondary)' }}>U74999HR2018PTC076488</p>

            <p className='font-semibold mb-1' style={{ color: 'var(--color-content-text)' }}>Registered Office</p>
            <p style={{ color: 'var(--color-content-text-secondary)' }}>Khasra No. 34/22, Second Floor, NK Tower, Kanhai Road, Sector-45, Gurugram, Haryana – 122003, India</p>
          </div>
          <div>
            <p className='font-semibold mb-1' style={{ color: 'var(--color-content-text)' }}>Website</p>
            <p className='mb-3' style={{ color: 'var(--color-content-text-secondary)' }}>
              <a href="https://gadgetrestore.in/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                https://gadgetrestore.in/
              </a>
            </p>

            <p className='font-semibold mb-1' style={{ color: 'var(--color-content-text)' }}>Support Contact</p>
            <p style={{ color: 'var(--color-content-text-secondary)' }}>
              Phone: <a href="tel:+918800003785" className="text-accent hover:underline">+91 8800003785</a><br />
              Email: <a href="mailto:support@gadgetrestore.in" className="text-accent hover:underline">support@gadgetrestore.in</a>
            </p>
          </div>
        </div>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>1. Preamble</h2>
          <p className='mb-3'>This document is an electronic record in terms of the Information Technology Act, 2000 and applicable rules thereunder, including amendments from time to time.</p>
          <p className='mb-3'>These Terms & Conditions (“Terms”) govern access to and use of the Gadget Restore website, customer dashboard, booking platform, repair services, pickup and drop services, mail-in repair services, diagnostic services, and all related services offered by Radical Aftermarket Private Limited (“Company”, “Gadget Restore”, “we”, “our”, or “us”).</p>
          <p className='mb-3'>By accessing the website, booking a repair, requesting a service, submitting a device for inspection, or otherwise using any Gadget Restore service, you acknowledge that you have read, understood, and agreed to be bound by these Terms.</p>
          <p>If you do not agree with these Terms, you must not use our services.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>2. Definitions</h2>
          <ul className='list-disc pl-5 space-y-2'>
            <li><strong style={{ color: 'var(--color-content-text)' }}>“Customer”</strong> means any individual, business, organization, or entity using Gadget Restore services.</li>
            <li><strong style={{ color: 'var(--color-content-text)' }}>“Device”</strong> means any smartphone, tablet, laptop, smartwatch, gaming console, or electronic product submitted for repair, diagnosis, inspection, or servicing.</li>
            <li><strong style={{ color: 'var(--color-content-text)' }}>“Repair Service”</strong> means any repair, replacement, refurbishment, diagnosis, inspection, or support service provided by Gadget Restore.</li>
            <li><strong style={{ color: 'var(--color-content-text)' }}>“Premium Compatible Part”</strong> means a third-party replacement component selected and approved by Gadget Restore for compatibility, performance, and reliability.</li>
            <li><strong style={{ color: 'var(--color-content-text)' }}>“Authorized Service Center”</strong> means a Gadget Restore-operated or approved repair facility.</li>
            <li><strong style={{ color: 'var(--color-content-text)' }}>“Service Order”</strong> means the repair request, invoice, estimate, booking confirmation, or work authorization generated for a repair request.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>3. Eligibility</h2>
          <p className='mb-3'>You must be legally capable of entering into a binding contract under applicable laws of India.</p>
          <p className='mb-3'>By submitting a device for service, you represent and warrant that:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>You are the lawful owner of the device or have authority from the owner;</li>
            <li>The device is not stolen, blacklisted, or subject to any legal dispute;</li>
            <li>Information provided by you is accurate and complete;</li>
            <li>The device does not contain illegal, prohibited, or unlawful content.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>4. Services Offered</h2>
          <p className='mb-3'>Gadget Restore may provide:</p>
          <ul className='list-disc pl-5 space-y-2 mb-3'>
            <li>Screen replacement services;</li>
            <li>Battery replacement services;</li>
            <li>Charging port replacement services;</li>
            <li>Camera repairs;</li>
            <li>Speaker and microphone repairs;</li>
            <li>Diagnostic services;</li>
            <li>Software support services;</li>
            <li>Pickup and drop services;</li>
            <li>Walk-in repair services;</li>
            <li>Mail-in repair services;</li>
            <li>Other electronic device repair services.</li>
          </ul>
          <p>The exact services available may vary depending on location, device model, part availability, and technical feasibility.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>5. Service Area</h2>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Doorstep pickup and drop services are available only within designated NCR serviceable locations.</li>
            <li>Customers outside serviceable NCR locations may not be eligible for doorstep services.</li>
            <li>Gadget Restore reserves the right to refuse service in locations deemed inaccessible, unsafe, or operationally unserviceable.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>6. Repair Estimates and Diagnostics</h2>
          <ul className='list-disc pl-5 space-y-2'>
            <li>All quotations provided before inspection are preliminary estimates.</li>
            <li>After physical inspection or diagnosis, Gadget Restore may discover additional faults, hidden defects, liquid damage, motherboard damage, or other issues not visible during initial assessment.</li>
            <li>Where revised findings affect pricing, the customer shall receive an updated quotation.</li>
            <li>No additional work shall be performed until customer approval is obtained.</li>
            <li>If the customer declines the revised quotation, the device may be returned unrepaired subject to applicable diagnostic or logistics charges.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>7. Customer Responsibilities</h2>
          <p className='mb-3'>The customer agrees to:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Provide accurate information regarding device condition;</li>
            <li>Disclose any previous repairs, liquid exposure, or known issues;</li>
            <li>Remove SIM cards where possible;</li>
            <li>Backup all personal data before service;</li>
            <li>Disable security locks if required for diagnosis;</li>
            <li>Cooperate with troubleshooting requests;</li>
            <li>Collect or receive repaired devices promptly.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>8. Data Backup and Loss of Data</h2>
          <p className='mb-3'>Customers are solely responsible for backing up all data before submitting any device.</p>
          <p className='mb-3'>Repair procedures may require software resets, component replacements, firmware updates, diagnostics, or testing that could result in partial or complete data loss.</p>
          <p className='mb-3'>Gadget Restore shall not be responsible for:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Loss of data;</li>
            <li>Corrupted data;</li>
            <li>Lost applications;</li>
            <li>Lost photographs, videos, contacts, or messages;</li>
            <li>Security credentials;</li>
            <li>Business interruption arising from data loss.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>9. Parts Used in Repairs</h2>
          <p className='mb-3'>Unless specifically agreed otherwise in writing, Gadget Restore uses premium compatible parts for repairs.</p>
          <p className='mb-3'>Customers acknowledge that:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 mb-3'>
            <li>Premium compatible parts are not original manufacturer components;</li>
            <li>Cosmetic appearance may vary slightly from original parts;</li>
            <li>Performance may vary marginally from original manufacturer specifications;</li>
            <li>Device manufacturers may not recognize third-party components.</li>
          </ol>
          <p>All parts undergo quality checks prior to installation.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>10. Same-Day Repair Service</h2>
          <p className='mb-3'>Same-day repair service is a target service level and not a guaranteed commitment.</p>
          <p className='mb-3'>Completion timelines depend on:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 mb-3'>
            <li>Device model;</li>
            <li>Fault complexity;</li>
            <li>Spare part availability;</li>
            <li>Technician availability;</li>
            <li>Logistics conditions;</li>
            <li>Force majeure events.</li>
          </ol>
          <p>Gadget Restore shall not be liable for delays beyond reasonable control.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>11. Pickup and Drop Service</h2>
          <p className='mb-3'>Pickup and drop service is provided free of charge within eligible NCR locations.</p>
          <p className='mb-3'>Customers must ensure:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 mb-3'>
            <li>The device is available during the scheduled pickup window;</li>
            <li>Contact information remains accessible;</li>
            <li>The device is securely handed over to authorized personnel.</li>
          </ol>
          <p>Missed appointments may require rescheduling.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>12. Mail-in Repair Services</h2>
          <p className='mb-3'>Customers choosing mail-in repairs are responsible for proper packaging before shipment.</p>
          <p className='mb-3'>Gadget Restore is not liable for:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Damage caused by inadequate packaging;</li>
            <li>Transit delays caused by courier providers;</li>
            <li>Courier losses occurring before receipt by Gadget Restore.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>13. Payment Terms</h2>
          <p className='mb-3'>Payment becomes due upon completion of repair and before release of the device unless otherwise agreed.</p>
          <p className='mb-3'>Accepted payment methods may include:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 mb-3'>
            <li>UPI;</li>
            <li>Bank transfer;</li>
            <li>Debit cards;</li>
            <li>Credit cards;</li>
            <li>Digital payment gateways;</li>
            <li>Other approved methods.</li>
          </ol>
          <p>Invoices shall be deemed accepted unless disputed within seven (7) days.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>14. Order Cancellation</h2>
          <p className='mb-3'>Customers may cancel repair requests before pickup and before repair work begins.</p>
          <p className='mb-3'>No cancellation shall be permitted after:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Device pickup;</li>
            <li>Device submission;</li>
            <li>Diagnosis completion;</li>
            <li>Part procurement specifically undertaken for the customer.</li>
          </ol>
          <p className='mt-3'>Applicable charges may still apply.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>15. Device Abandonment</h2>
          <p>If a repaired device remains uncollected for more than ninety (90) days despite reasonable notification attempts, Gadget Restore reserves the right to recover storage, logistics, administrative, and associated costs as permitted by applicable law.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>16. Warranty</h2>
          <p className='mb-3'>Warranty terms are governed exclusively by the Gadget Restore Limited Warranty Policy.</p>
          <p className='mb-3'>Customers acknowledge that warranty coverage:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Applies only to replaced parts;</li>
            <li>Is limited to the warranty period stated on the invoice;</li>
            <li>Does not cover physical damage, liquid damage, misuse, or excluded conditions.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>17. Limitation of Liability</h2>
          <p className='mb-3'>To the maximum extent permitted by law:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Gadget Restore’s total liability shall not exceed the amount paid by the customer for the relevant repair service;</li>
            <li>Gadget Restore shall not be liable for indirect, incidental, consequential, special, punitive, or exemplary damages;</li>
            <li>Gadget Restore shall not be liable for loss of profits, revenue, goodwill, business opportunities, or data.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>18. Indemnity</h2>
          <p className='mb-3'>The customer agrees to indemnify and hold harmless Gadget Restore, its directors, employees, contractors, and affiliates against claims, damages, liabilities, penalties, and expenses arising from:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Violation of these Terms;</li>
            <li>False information provided by the customer;</li>
            <li>Ownership disputes involving the device;</li>
            <li>Illegal content stored on the device.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>19. Intellectual Property</h2>
          <p>All trademarks, logos, graphics, content, software, designs, and materials displayed on the website remain the exclusive property of Gadget Restore or its licensors. No rights are granted except those expressly stated.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>20. Privacy</h2>
          <p>Collection and processing of personal information shall be governed by the Gadget Restore Privacy Policy. By using the services, customers consent to such processing as described therein.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>21. Force Majeure</h2>
          <p className='mb-3'>Gadget Restore shall not be liable for delays or failures caused by events beyond reasonable control including:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2'>
            <li>Natural disasters;</li>
            <li>Floods;</li>
            <li>Fire;</li>
            <li>Pandemic events;</li>
            <li>Government restrictions;</li>
            <li>Labor disputes;</li>
            <li>Supply chain disruptions;</li>
            <li>Internet or communication outages.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>22. Modifications</h2>
          <p>Gadget Restore reserves the right to modify these Terms at any time. Updated versions shall become effective upon publication on the website. Continued use of services constitutes acceptance of revised Terms.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>23. Governing Law and Jurisdiction</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of India. All disputes shall be subject to the exclusive jurisdiction of competent courts located in Gurugram, Haryana.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>24. Grievance Redressal</h2>
          <p className='mb-3'>For complaints, concerns, notices, or grievance matters:</p>
          <div className='p-4 rounded-xl border text-xs space-y-2' style={{ background: 'var(--color-content-card)', borderColor: 'var(--color-content-border)' }}>
            <p className='font-bold' style={{ color: 'var(--color-content-text)' }}>Radical Aftermarket Private Limited</p>
            <p style={{ color: 'var(--color-content-text-secondary)' }}>Khasra No. 34/22, Second Floor, NK Tower, Kanhai Road, Sector-45, Gurugram, Haryana – 122003</p>
            <p style={{ color: 'var(--color-content-text-secondary)' }}>
              Phone: <a href="tel:+918800003785" className="text-accent hover:underline">+91 8800003785</a><br />
              Email: <a href="mailto:support@gadgetrestore.in" className="text-accent hover:underline">support@gadgetrestore.in</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-content-text)' }}>25. Acceptance</h2>
          <p>By accessing the website, placing a booking, requesting a repair, submitting a device, or using any Gadget Restore service, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
        </section>
      </div>
    </div>
  )
}
