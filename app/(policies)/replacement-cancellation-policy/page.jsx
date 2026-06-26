'use client'

import React from 'react'

export default function ReplacementCancellationPolicy() {
  return (
    <div>
      <h1 className='text-xl lg:text-4xl font-black  mb-3'>GADGET RESTORE REPLACEMENT & CANCELLATION POLICY</h1>
      <div className='flex flex-wrap gap-x-6 gap-y-2 text-xs mb-10' style={{ color: 'var(--color-content-text-secondary)' }}>
        <p>Effective Date: June 25, 2026</p>
        <p>•</p>
        <p>Last Updated: June 25, 2026</p>
      </div>

      <div className='space-y-8 text-sm leading-relaxed text-zinc-300'>
        {/* Company & Support Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border text-xs mb-8' style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--color-content-border)' }}>
          <div>
            <p className='font-semibold text-white mb-1'>Operated by</p>
            <p className='text-zinc-400 mb-3'>Radical Aftermarket Private Limited<br />(trading as Gadget Restore)</p>

            <p className='font-semibold text-white mb-1'>CIN</p>
            <p className='text-zinc-400 mb-3'>U74999HR2018PTC076488</p>

            <p className='font-semibold text-white mb-1'>Registered Office</p>
            <p className='text-zinc-400'>Khasra No. 34/22, Second Floor, NK Tower, Kanhai Road, Sector-45, Gurugram, Haryana – 122003, India</p>
          </div>
          <div>
            <p className='font-semibold text-white mb-1'>Website</p>
            <p className='text-zinc-400 mb-3'>
              <a href="https://gadgetrestore.in" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                https://gadgetrestore.in
              </a>
            </p>

            <p className='font-semibold text-white mb-1'>Support Contact</p>
            <p className='text-zinc-400'>
              Phone: <a href="tel:+918800003785" className="text-accent hover:underline">+91 8800003785</a><br />
              Email: <a href="mailto:support@gadgetrestore.in" className="text-accent hover:underline">support@gadgetrestore.in</a>
            </p>
          </div>
        </div>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>1. Overview</h2>
          <p className='mb-3'>This Replacement & Cancellation Policy governs repair services provided by Gadget Restore through:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Walk-in Repairs</li>
            <li>Free Pickup & Drop Services</li>
            <li>Mail-In Repair Services</li>
            <li>Website Bookings</li>
            <li>Customer Dashboard Bookings</li>
          </ul>
          <p className='mb-3'>This Policy should be read together with:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Warranty Policy</li>
            <li>Shipping & Logistics Policy</li>
            <li>Repair Invoice</li>
          </ul>
          <p>By placing a service request with Gadget Restore, you agree to this Policy.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. Nature of Services</h2>
          <p className='mb-3'>Gadget Restore is a repair-service provider and does not primarily sell finished products through the repair platform. Accordingly, replacement, cancellation, refund, and warranty rights differ from those applicable to traditional e-commerce product purchases.</p>
          <p className='mb-3'>Customers acknowledge that repair services involve:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Diagnostics</li>
            <li>Labor</li>
            <li>Spare-part procurement</li>
            <li>Device handling</li>
            <li>Technical evaluation</li>
            <li>Installation services</li>
          </ul>
          <p>Once repair work has commenced, service value has already been created and may not be reversible.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. Service Cancellation Policy</h2>
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold text-white mb-1'>3.1 Cancellation Before Pickup</h3>
              <p className='mb-2'>Customers may cancel a repair request without charge if:</p>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Pickup has not been scheduled; and</li>
                <li>No diagnostics have been performed; and</li>
                <li>No spare parts have been ordered specifically for the repair.</li>
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold text-white mb-1'>3.2 Cancellation After Pickup</h3>
              <p className='mb-2'>Cancellation requests shall not be accepted after:</p>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Device pickup has been completed;</li>
                <li>Device has been submitted at a service center;</li>
                <li>Diagnostics have commenced;</li>
                <li>Spare parts have been procured;</li>
                <li>Repair work has begun.</li>
              </ul>
              <p className='mt-2'>Customers acknowledge that logistics, diagnostic, labor, and procurement costs may already have been incurred.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>4. Diagnostic Rejection</h2>
          <p className='mb-3'>Where Gadget Restore identifies additional faults and provides a revised quotation:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Customers may choose to reject the revised quotation;</li>
            <li>No further repair work shall be performed without approval.</li>
          </ul>
          <p className='mb-3'>In such cases:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>The device may be returned unrepaired;</li>
            <li>Previously completed diagnostics remain chargeable where applicable;</li>
            <li>Procurement costs for special-order parts may remain payable.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>5. No Cancellation After Repair Commencement</h2>
          <p className='mb-3'>Once any of the following occur:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Device disassembly;</li>
            <li>Component removal;</li>
            <li>Diagnostics requiring internal inspection;</li>
            <li>Repair work commencement;</li>
            <li>Replacement part installation;</li>
          </ul>
          <p>The repair service shall be deemed commenced. No cancellation shall be permitted thereafter.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>6. Replacement Policy for Repair Services</h2>
          <p className='mb-3'>Because Gadget Restore provides repair services rather than product sales, replacement requests shall be governed by the Warranty Policy.</p>
          <p className='mb-3'>A replacement may be offered only where:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>A covered replacement part suffers a verified manufacturing defect;</li>
            <li>The defect falls within the applicable warranty period;</li>
            <li>The claim satisfies all warranty conditions.</li>
          </ul>
          <p>Replacement of a defective covered part shall be the sole remedy available under warranty.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>7. Eligibility for Replacement</h2>
          <p className='mb-3'>To qualify for a replacement under warranty:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>The device must be the same device referenced on the invoice;</li>
            <li>The claim must relate directly to the replaced part;</li>
            <li>The defect must arise from manufacturing or workmanship failure;</li>
            <li>Warranty coverage must remain valid;</li>
            <li>The device must not show signs of physical or liquid damage;</li>
            <li>No unauthorized repair or tampering must have occurred.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>8. Replacement Claim Process</h2>
          <p className='mb-3'>Customers seeking replacement under warranty must:</p>
          <div className='space-y-3 pl-4 mb-4 border-l-2 border-zinc-700 text-sm'>
            <p><strong className='text-white'>Step 1:</strong> Contact Gadget Restore Support.</p>
            <p><strong className='text-white'>Step 2:</strong> Provide:</p>
            <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
              <li>Invoice number</li>
              <li>Device details</li>
              <li>Description of issue</li>
              <li>Photo evidence (where applicable)</li>
              <li>Video evidence demonstrating malfunction</li>
            </ul>
            <p><strong className='text-white'>Step 3:</strong> Submit the device for inspection.</p>
            <p><strong className='text-white'>Step 4:</strong> Allow Gadget Restore to verify warranty eligibility.</p>
          </div>
          <p>Approval remains subject to inspection findings.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>9. Replacement Resolution</h2>
          <p className='mb-3'>Where a replacement claim is approved, Gadget Restore may:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Repair the defective replacement part;</li>
            <li>Replace the defective replacement part;</li>
            <li>Reinstall an equivalent premium compatible replacement part.</li>
          </ul>
          <p>The method of resolution shall be determined solely by Gadget Restore.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>10. Claim Review Timeline</h2>
          <p className='mb-3'>Gadget Restore aims to review and process eligible replacement claims within five (5) working days following claim acceptance.</p>
          <p className='mb-3'>Timelines may vary due to:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Spare-part availability;</li>
            <li>Technical requirements;</li>
            <li>Logistics delays;</li>
            <li>Force majeure events.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>11. Non-Eligible Replacement Requests</h2>
          <p className='mb-3'>Replacement requests shall be rejected where:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Warranty period has expired;</li>
            <li>Physical damage is present;</li>
            <li>Liquid damage is present;</li>
            <li>Display cracks exist;</li>
            <li>Green line issues are reported;</li>
            <li>Pink line issues are reported;</li>
            <li>White line issues are reported;</li>
            <li>Device tampering is detected;</li>
            <li>Unauthorized repairs are detected;</li>
            <li>Issues are unrelated to the replaced part.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>12. Refund Policy</h2>
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold text-white mb-1'>12.1 Repair Services</h3>
              <p className='mb-2'>Repair services are generally non-refundable. Customers acknowledge that repair services involve:</p>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Technician time;</li>
                <li>Diagnostics;</li>
                <li>Labor;</li>
                <li>Logistics;</li>
                <li>Spare-part procurement;</li>
                <li>Testing;</li>
                <li>Quality control.</li>
              </ul>
              <p className='mt-2'>Accordingly, refunds shall not be available merely because:</p>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>The customer changes their mind;</li>
                <li>The customer declines a completed repair;</li>
                <li>The customer wishes to reverse an approved repair.</li>
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold text-white mb-1'>12.2 Approved Refunds</h3>
              <p className='mb-2'>Refunds may be considered only where:</p>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Gadget Restore is unable to perform the service;</li>
                <li>Payment was collected in error;</li>
                <li>Required spare parts are permanently unavailable and no alternative solution exists;</li>
                <li>Refund is otherwise required under applicable law.</li>
              </ul>
              <p className='mt-2'>Refund approval remains at the sole discretion of Gadget Restore, except where mandated by law.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>13. Refund Process</h2>
          <p className='mb-3'>Where a refund is approved:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Refunds shall be processed through the original payment method wherever feasible;</li>
            <li>Verification may be required before processing;</li>
            <li>Additional documentation may be requested.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>14. Refund Timeline</h2>
          <p className='mb-3'>Approved refunds shall generally be initiated within seven (7) business days from approval.</p>
          <p className='mb-3'>Actual credit timelines may depend on:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Banks;</li>
            <li>Card issuers;</li>
            <li>UPI providers;</li>
            <li>Payment gateways.</li>
          </ul>
          <p>Gadget Restore shall not be responsible for delays caused by third-party financial institutions.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>15. No Cash Compensation</h2>
          <p className='mb-3'>Customers shall not be entitled to:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Monetary compensation;</li>
            <li>Loss-of-use compensation;</li>
            <li>Business-loss compensation;</li>
            <li>Consequential damages;</li>
            <li>Opportunity-loss claims;</li>
          </ul>
          <p>Except where required under applicable law.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>16. Limitation of Liability</h2>
          <p className='mb-3'>To the maximum extent permitted by law:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>Gadget Restore’s liability under this Policy shall not exceed the repair charges paid for the relevant service;</li>
            <li>Gadget Restore shall not be liable for indirect, incidental, consequential, punitive, or special damages.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>17. Force Majeure</h2>
          <p className='mb-3'>Gadget Restore shall not be liable for delays or inability to process replacements, cancellations, or refunds due to:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Natural disasters;</li>
            <li>Floods;</li>
            <li>Fires;</li>
            <li>Pandemics;</li>
            <li>Government restrictions;</li>
            <li>Transportation disruptions;</li>
            <li>Supply-chain shortages;</li>
            <li>Events beyond reasonable control.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>18. Governing Law and Jurisdiction</h2>
          <p>This Policy shall be governed by the laws of India. Any dispute arising under this Policy shall be subject to the exclusive jurisdiction of the competent courts located in Gurugram, Haryana.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>19. Grievance Redressal</h2>
          <p className='mb-3'>For replacement, cancellation, or refund-related concerns:</p>
          <div className='p-4 rounded-xl border text-xs space-y-2' style={{ background: 'rgba(255, 255, 255, 0.01)', borderColor: 'var(--color-content-border)' }}>
            <p className='font-semibold text-white'>Radical Aftermarket Private Limited</p>
            <p className='text-zinc-400'>Khasra No. 34/22, Second Floor, NK Tower, Kanhai Road, Sector-45, Gurugram, Haryana – 122003</p>
            <p className='text-zinc-400'>
              Phone: <a href="tel:+918800003785" className="text-accent hover:underline">+91 8800003785</a><br />
              Email: <a href="mailto:support@gadgetrestore.in" className="text-accent hover:underline">support@gadgetrestore.in</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>20. Policy Changes</h2>
          <p>Gadget Restore reserves the right to amend this Policy at any time. Updated versions shall become effective upon publication on the Website.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>21. Acceptance</h2>
          <p>By booking a repair service, submitting a device for repair, requesting a replacement, seeking cancellation, or using any Gadget Restore service, you acknowledge that you have read, understood, and agreed to this Replacement & Cancellation Policy.</p>
        </section>
      </div>
    </div>
  )
}
