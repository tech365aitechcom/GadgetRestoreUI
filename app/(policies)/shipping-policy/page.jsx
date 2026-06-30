'use client'

import React from 'react'

export default function ShippingPolicy() {
  return (
    <div>
      <h1 className='text-xl lg:text-4xl font-black  mb-3'>GADGET RESTORE SHIPPING & LOGISTICS POLICY</h1>
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
          <p className='mb-3'>This Shipping & Logistics Policy governs all device pickup, transportation, delivery, mail-in repair logistics, and related services offered by Gadget Restore.</p>
          <p className='mb-3'>This Policy should be read together with:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Warranty Policy</li>
            <li>Repair Invoice</li>
            <li>Service Order</li>
          </ul>
          <p>By booking a repair service, scheduling a pickup, using mail-in repair services, or accepting delivery of a repaired device, you agree to this Policy.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. Service Coverage</h2>
          <p className='mb-3'>Gadget Restore currently operates within designated serviceable locations in the National Capital Region (“NCR”).</p>
          <p className='mb-3'>Doorstep pickup and drop services are available only within Gadget Restore’s active NCR service zones.</p>
          <p className='mb-3'>Service availability may vary based on:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Pin code</li>
            <li>Operational capacity</li>
            <li>Safety considerations</li>
            <li>Logistics coverage</li>
            <li>Weather conditions</li>
            <li>Public restrictions</li>
          </ul>
          <p>Gadget Restore reserves the right to refuse pickup or delivery requests in areas deemed unserviceable.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. Logistics Services Offered</h2>
          <p className='mb-3'>Gadget Restore may provide:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>Free doorstep pickup service</li>
            <li>Free doorstep delivery service</li>
            <li>Walk-in service support</li>
            <li>Mail-in repair service</li>
            <li>Reverse logistics support</li>
            <li>Warranty logistics support</li>
          </ol>
          <p className='mt-3'>Service availability may vary depending on location and operational constraints.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>4. Free Pickup & Drop Service</h2>
          <p className='mb-3'>Gadget Restore provides complimentary pickup and delivery services within eligible NCR locations.</p>
          <p className='mb-3'>Customers are not charged separately for standard pickup and drop services unless expressly communicated before service confirmation.</p>
          <p className='mb-3'>Free logistics service does not guarantee:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Specific pickup times</li>
            <li>Specific delivery times</li>
            <li>Same-day collection</li>
            <li>Same-day return</li>
          </ul>
          <p>Scheduling remains subject to operational availability.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>5. Pickup Booking Process</h2>
          <p className='mb-3'>Customers may schedule a pickup through:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Website booking</li>
            <li>Customer support</li>
            <li>Customer dashboard</li>
            <li>Authorized Gadget Restore channels</li>
          </ul>
          <p className='mb-3'>Customers must provide:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Name</li>
            <li>Contact number</li>
            <li>Pickup address</li>
            <li>Device details</li>
            <li>Issue description</li>
          </ul>
          <p>Gadget Restore may contact customers to verify booking information before dispatching logistics personnel.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>6. Customer Responsibilities During Pickup</h2>
          <p className='mb-3'>Prior to pickup, customers must:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>Backup all device data;</li>
            <li>Remove SIM cards where possible;</li>
            <li>Remove memory cards where possible;</li>
            <li>Disable security locks if requested for diagnostics;</li>
            <li>Accurately disclose known device issues;</li>
            <li>Ensure the device is available during the scheduled pickup window.</li>
          </ol>
          <p className='mt-3'>Failure to comply may result in delays or inability to process repairs.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>7. Device Condition Recording</h2>
          <p className='mb-3'>At the time of pickup or acceptance:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Device condition may be photographed;</li>
            <li>Visible cosmetic damage may be documented;</li>
            <li>Existing cracks, dents, scratches, and other defects may be recorded;</li>
            <li>Device identifiers may be verified.</li>
          </ul>
          <p>Such records may be used during quality control, warranty evaluation, and dispute resolution.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>8. Failed Pickup Attempts</h2>
          <p className='mb-3'>A pickup attempt may be considered failed where:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Customer is unavailable;</li>
            <li>Address details are incorrect;</li>
            <li>Device is not available;</li>
            <li>Customer refuses handover.</li>
          </ul>
          <p className='mb-3'>Where a pickup fails:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Pickup may be rescheduled;</li>
            <li>Additional verification may be required;</li>
            <li>Gadget Restore may decline future pickup requests.</li>
          </ul>
          <p>Repeated failed pickups may result in service cancellation.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>9. Transportation of Devices</h2>
          <p className='mb-3'>Devices collected by Gadget Restore are transported using internal personnel and/or authorized logistics partners.</p>
          <p className='mb-3'>Reasonable care shall be exercised during transportation.</p>
          <p className='mb-3'>However, Gadget Restore shall not be liable for delays caused by:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Traffic conditions;</li>
            <li>Weather disruptions;</li>
            <li>Public emergencies;</li>
            <li>Government restrictions;</li>
            <li>Transportation disruptions.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>10. Diagnostic and Repair Hold Period</h2>
          <p className='mb-3'>After receipt of the device:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Diagnostics may be performed;</li>
            <li>Additional faults may be identified;</li>
            <li>Revised quotations may be issued.</li>
          </ul>
          <p>Customers must approve revised quotations before additional repairs proceed. Devices may remain on hold pending customer approval.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>11. Revised Quotations</h2>
          <p className='mb-3'>Where additional issues are discovered during diagnosis:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Customers shall receive updated estimates;</li>
            <li>Repairs beyond the original request shall not commence without approval;</li>
            <li>Customers may choose to decline revised quotations.</li>
          </ul>
          <p>If declined, the device may be returned subject to applicable conditions.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>12. Delivery of Repaired Devices</h2>
          <p className='mb-3'>After repair completion:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Quality control inspections are performed;</li>
            <li>Devices undergo functional testing;</li>
            <li>Delivery is scheduled.</li>
          </ul>
          <p>Delivery timelines are estimates only and may vary based on operational factors.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>13. Same-Day Repair & Delivery</h2>
          <p className='mb-3'>Gadget Restore may offer same-day repair services.</p>
          <p className='mb-3'>Same-day completion remains subject to:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Device model;</li>
            <li>Part availability;</li>
            <li>Technical complexity;</li>
            <li>Logistics availability;</li>
            <li>Customer responsiveness.</li>
          </ul>
          <p>Same-day service is a service objective and not a guaranteed commitment.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>14. Customer Responsibilities During Delivery</h2>
          <p className='mb-3'>Customers must:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Be available during the delivery window;</li>
            <li>Verify device identity;</li>
            <li>Inspect the device upon receipt;</li>
            <li>Report concerns promptly.</li>
          </ul>
          <p>Failure to accept delivery may require rescheduling.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>15. Failed Delivery Attempts</h2>
          <p className='mb-3'>A delivery attempt may be considered unsuccessful where:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Customer is unavailable;</li>
            <li>Delivery address is inaccessible;</li>
            <li>Customer refuses delivery.</li>
          </ul>
          <p className='mb-3'>Where delivery fails:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Additional delivery attempts may be scheduled;</li>
            <li>Device collection from an authorized service center may be required.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>16. Mail-in Repair Services</h2>
          <p className='mb-3'>Customers may submit devices through approved courier services where applicable.</p>
          <p className='mb-3'>Customers using mail-in services must:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Securely package devices;</li>
            <li>Use suitable protective materials;</li>
            <li>Include required documentation;</li>
            <li>Provide accurate contact information.</li>
          </ul>
          <p>Customers remain responsible for the device until it is received by Gadget Restore.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>17. Packaging Requirements</h2>
          <p className='mb-3'>Customers sending devices through courier services should:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Use sturdy packaging;</li>
            <li>Protect devices against impact;</li>
            <li>Avoid loose packaging;</li>
            <li>Include order references where applicable.</li>
          </ul>
          <p>Improper packaging may increase the risk of transit damage.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>18. Transit Damage</h2>
          <p className='mb-3'><strong className='text-white'>For customer-arranged shipments:</strong></p>
          <p className='mb-3'>Gadget Restore shall not be responsible for damage occurring before physical receipt of the package. Customers should address transit claims directly with the courier provider.</p>
          <p className='mb-3'><strong className='text-white'>For Gadget Restore-arranged logistics:</strong></p>
          <p>Claims relating to transit damage must be reported immediately upon delivery.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>19. Risk of Loss</h2>
          <p className='mb-3'><strong className='text-white'>For customer-arranged shipping:</strong></p>
          <p className='mb-3'>Risk remains with the customer until the device is received by Gadget Restore.</p>
          <p className='mb-3'><strong className='text-white'>For Gadget Restore-arranged pickup:</strong></p>
          <p>Risk transfers upon physical collection by authorized personnel, subject to recorded device condition.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>20. Undeliverable Devices</h2>
          <p className='mb-3'>Devices may be deemed undeliverable where:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Customer cannot be contacted;</li>
            <li>Address information is incorrect;</li>
            <li>Delivery repeatedly fails.</li>
          </ul>
          <p>Gadget Restore may retain devices until contact is established. Additional storage or handling charges may apply where legally permissible.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>21. Storage of Devices</h2>
          <p>Customers are expected to collect or receive repaired devices promptly. Where devices remain unclaimed for extended periods, Gadget Restore reserves the right to recover reasonable storage, handling, administrative, and logistics costs.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>22. Warranty Logistics</h2>
          <p className='mb-3'>For approved warranty claims:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Pickup may be arranged at Gadget Restore’s discretion;</li>
            <li>Warranty inspections may be required;</li>
            <li>Devices must be submitted for evaluation before warranty approval.</li>
          </ul>
          <p>Warranty eligibility remains subject to the Warranty Policy.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>23. Force Majeure</h2>
          <p className='mb-3'>Gadget Restore shall not be liable for delays caused by:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Natural disasters;</li>
            <li>Floods;</li>
            <li>Fires;</li>
            <li>Military strikes;</li>
            <li>Government restrictions;</li>
            <li>Transportation disruptions;</li>
            <li>Pandemics;</li>
            <li>Supply chain shortages;</li>
            <li>Events beyond reasonable control.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>24. Limitation of Liability</h2>
          <p className='mb-3'>To the maximum extent permitted by law:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>Gadget Restore’s liability relating to logistics services shall not exceed the amount paid by the customer for the relevant repair service;</li>
            <li>Gadget Restore shall not be liable for indirect, incidental, consequential, punitive, or special damages;</li>
            <li>Gadget Restore shall not be liable for loss of business, profits, opportunities, goodwill, or data.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>25. Governing Law and Jurisdiction</h2>
          <p>This Shipping & Logistics Policy shall be governed by the laws of India. Any disputes arising under this Policy shall be subject to the exclusive jurisdiction of the competent courts located in Gurugram, Haryana.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>26. Grievance Redressal</h2>
          <p className='mb-3'>For shipping, pickup, delivery, or logistics-related concerns:</p>
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
          <h2 className='text-lg font-bold text-white mb-3'>27. Policy Changes</h2>
          <p>Gadget Restore reserves the right to amend this Policy at any time. Updated versions shall become effective upon publication on the Website. Continued use of Gadget Restore services constitutes acceptance of revised terms.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>28. Acceptance</h2>
          <p>By scheduling a pickup, submitting a device for repair, using mail-in repair services, accepting delivery, or otherwise using Gadget Restore services, you acknowledge that you have read, understood, and agreed to this Shipping & Logistics Policy.</p>
        </section>
      </div>
    </div>
  )
}
