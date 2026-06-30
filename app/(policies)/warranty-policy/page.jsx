'use client'

import React from 'react'

export default function WarrantyPolicy() {
  return (
    <div>
      <h1 className='text-xl lg:text-4xl font-black  mb-3'>GADGET RESTORE WARRANTY POLICY</h1>
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
          <p className='mb-3'>This Limited Warranty Policy governs all repair services performed by Gadget Restore.</p>
          <p className='mb-3'>This Warranty Policy applies exclusively to parts replaced by Gadget Restore during an authorized repair service and shall be read together with:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Shipping & Logistics Policy</li>
            <li>Service Invoice</li>
            <li>Repair Order</li>
          </ul>
          <p>By availing any Gadget Restore service, the customer agrees to the terms of this Warranty Policy.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. Warranty Coverage</h2>
          <p className='mb-3'>All replacement parts installed by Gadget Restore carry a limited warranty of three (3) months from the invoice date unless expressly stated otherwise on the invoice.</p>
          <p className='mb-3'>The warranty applies only to:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>The specific replacement part installed by Gadget Restore</li>
            <li>The specific device identified on the invoice</li>
            <li>Manufacturing defects in the replaced part</li>
            <li>Functional failure of the replaced part occurring during normal usage</li>
          </ul>
          <p>The warranty period begins on the original invoice date and cannot be restarted, renewed, or extended through subsequent warranty claims.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. Applicability of Warranty</h2>
          <p className='mb-3'>The warranty is applicable only when:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>The repaired device matches the device identified on the original invoice;</li>
            <li>The defect relates directly to the replaced part;</li>
            <li>The defect arises from manufacturing or workmanship issues;</li>
            <li>The customer complies with all warranty requirements;</li>
            <li>The warranty period has not expired.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>4. Parts Covered Under Warranty</h2>
          <p className='mb-3'>Subject to the terms of this Policy, warranty coverage may apply to replacement parts including:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Display assemblies</li>
            <li>Batteries</li>
            <li>Charging ports</li>
            <li>Cameras</li>
            <li>Speakers</li>
            <li>Microphones</li>
            <li>Earpieces</li>
            <li>Power buttons</li>
            <li>Volume buttons</li>
            <li>Flex cables</li>
            <li>Connectors</li>
            <li>Internal replacement modules</li>
            <li>Other replacement components installed by Gadget Restore</li>
          </ul>
          <p>Coverage applies only to the replaced component and not to the entire device.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>5. Premium Compatible Parts</h2>
          <p className='mb-3'>Unless otherwise stated, Gadget Restore uses premium compatible replacement parts.</p>
          <p className='mb-3'>Customers acknowledge that:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Premium compatible parts are not original manufacturer parts;</li>
            <li>Cosmetic appearance may vary slightly from the original components;</li>
            <li>Device manufacturers may display service notifications or warnings after third-party repairs;</li>
            <li>Certain software features may be restricted by device manufacturers after third-party repairs.</li>
          </ul>
          <p>Such circumstances do not constitute warranty defects.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>6. What is Covered</h2>
          <p className='mb-3'>Warranty coverage includes:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>Display malfunction caused by manufacturing defects;</li>
            <li>Touch failure arising from manufacturing defects in the replaced display;</li>
            <li>Battery malfunction caused by manufacturing defects;</li>
            <li>Failure of the replaced charging port during normal use;</li>
            <li>Failure of replaced cameras, microphones, speakers, or other covered components caused by manufacturing or workmanship defects;</li>
            <li>Installation-related workmanship defects attributable to Gadget Restore.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>7. What is Not Covered</h2>
          <p className='mb-3'>The warranty does not cover:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>Physical damage;</li>
            <li>Liquid or water damage;</li>
            <li>Moisture ingress;</li>
            <li>Accidental damage;</li>
            <li>Impact damage;</li>
            <li>Pressure damage;</li>
            <li>Heat damage;</li>
            <li>Fire damage;</li>
            <li>Electrical surge damage;</li>
            <li>Cosmetic damage;</li>
            <li>Normal wear and tear;</li>
            <li>Device abuse or misuse;</li>
            <li>Software issues;</li>
            <li>Malware or virus-related issues;</li>
            <li>Unauthorized modifications;</li>
            <li>Unauthorized repairs;</li>
            <li>Data loss;</li>
            <li>Customer negligence.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>8. Display Exclusions</h2>
          <p className='mb-3'>The following display-related conditions are expressly excluded from warranty coverage:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Green line issues</li>
            <li>Pink line issues</li>
            <li>White line issues</li>
            <li>Purple line issues</li>
            <li>Display discoloration</li>
            <li>Burn-in</li>
            <li>Dead pixels</li>
            <li>Pixel spots</li>
            <li>Bright spots</li>
            <li>Black spots</li>
            <li>OLED defects caused by impact</li>
            <li>Pressure marks</li>
            <li>Screen cracks</li>
            <li>Glass breakage</li>
            <li>Touch issues caused by physical damage</li>
            <li>Display separation caused by impact</li>
            <li>Display blankness arising from physical or liquid damage</li>
          </ul>
          <p>These conditions are not covered regardless of whether they occur during the warranty period.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>9. Physical and Liquid Damage Exclusions</h2>
          <p className='mb-3'>Warranty shall immediately become void if the device shows evidence of:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Cracks</li>
            <li>Dents</li>
            <li>Frame bending</li>
            <li>Chassis deformation</li>
            <li>Liquid exposure</li>
            <li>Corrosion</li>
            <li>Water indicators triggered</li>
            <li>Impact damage</li>
            <li>Pressure damage</li>
            <li>Burn marks</li>
            <li>Tampering</li>
          </ul>
          <p>Where physical or liquid damage is identified, Gadget Restore reserves the right to reject the warranty claim.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>10. Issues Not Related to Replaced Parts</h2>
          <p className='mb-3'>Warranty applies only to the replaced component.</p>
          <p className='mb-3'>Issues unrelated to the replaced component are not covered.</p>
          <p className='mb-3'>Examples include:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Motherboard faults</li>
            <li>Network issues</li>
            <li>Face ID issues</li>
            <li>Fingerprint sensor issues</li>
            <li>Camera faults unrelated to a replaced camera</li>
            <li>Speaker faults unrelated to a replaced speaker</li>
            <li>Charging issues unrelated to a replaced charging port</li>
          </ul>
          <p>Such issues require a separate repair order.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>11. Warranty Claim Process</h2>
          <p className='mb-3'>To initiate a warranty claim, customers must:</p>
          <div className='space-y-3 pl-4 mb-4 border-l-2 border-zinc-700 text-sm'>
            <p><strong className='text-white'>Step 1:</strong> Contact Gadget Restore support.</p>
            <p><strong className='text-white'>Step 2:</strong> Provide:</p>
            <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
              <li>Invoice number</li>
              <li>Device details</li>
              <li>Description of issue</li>
              <li>Photo evidence (if applicable)</li>
              <li>Video evidence showing malfunction</li>
            </ul>
            <p><strong className='text-white'>Step 3:</strong> Allow Gadget Restore to inspect and verify the device.</p>
          </div>
          <p>Additional information may be requested where necessary.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>12. Claim Verification</h2>
          <p className='mb-3'>All warranty claims are subject to technical inspection.</p>
          <p className='mb-3'>Gadget Restore may:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Conduct diagnostics;</li>
            <li>Inspect internal components;</li>
            <li>Review service history;</li>
            <li>Verify warranty eligibility;</li>
            <li>Review customer-provided evidence.</li>
          </ul>
          <p>Approval of warranty claims shall be solely at the discretion of Gadget Restore following inspection.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>13. Claim Resolution</h2>
          <p className='mb-3'>If a warranty claim is approved, Gadget Restore may:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Repair the defective replacement part;</li>
            <li>Replace the defective replacement part;</li>
            <li>Perform additional corrective work as deemed appropriate.</li>
          </ul>
          <p>The choice of remedy shall remain solely with Gadget Restore.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>14. Resolution Timeline</h2>
          <p className='mb-3'>Accepted warranty claims are generally resolved within five (5) working days after claim approval.</p>
          <p className='mb-3'>Resolution timelines may vary due to:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Part availability;</li>
            <li>Logistics delays;</li>
            <li>Technical complexity;</li>
            <li>Force majeure events.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>15. Non-Transferability</h2>
          <p className='mb-3'>This warranty:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Applies only to the original customer;</li>
            <li>Applies only to the original repaired device;</li>
            <li>Cannot be transferred to another person;</li>
            <li>Cannot be assigned upon resale of the device.</li>
          </ul>
          <p>Any change in ownership automatically voids the warranty.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>16. Warranty Void Conditions</h2>
          <p className='mb-3'>Warranty shall become void if:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>The device is repaired by a third party after Gadget Restore service;</li>
            <li>The device is opened by an unauthorized person;</li>
            <li>Hardware tampering occurs;</li>
            <li>Software tampering occurs;</li>
            <li>Rooting or jailbreaking is performed;</li>
            <li>Physical damage occurs;</li>
            <li>Liquid damage occurs;</li>
            <li>Customer misuse is detected;</li>
            <li>IMEI or serial numbers are altered or removed;</li>
            <li>False information is provided during the claim process.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>17. Data Backup Responsibility</h2>
          <p className='mb-3'>Customers are solely responsible for backing up device data.</p>
          <p className='mb-3'>Warranty service may require diagnostics, resets, testing, or component replacement.</p>
          <p className='mb-3'>Gadget Restore shall not be liable for:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Data loss;</li>
            <li>Data corruption;</li>
            <li>Loss of applications;</li>
            <li>Loss of photographs;</li>
            <li>Loss of contacts;</li>
            <li>Business interruption.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>18. No Refunds</h2>
          <p className='mb-3'>Warranty claims are not redeemable for:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Cash refunds;</li>
            <li>Monetary compensation;</li>
            <li>Store credit;</li>
            <li>Exchange value;</li>
            <li>Financial reimbursement.</li>
          </ul>
          <p>The sole remedies available under this Policy are repair or replacement of the defective covered part.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>19. Limitation of Liability</h2>
          <p className='mb-3'>To the maximum extent permitted by law:</p>
          <ol className='list-[lower-alpha] pl-5 space-y-2 text-zinc-300'>
            <li>Gadget Restore’s total liability shall not exceed the original repair amount paid for the relevant service;</li>
            <li>Gadget Restore shall not be liable for indirect, incidental, consequential, punitive, or special damages;</li>
            <li>Gadget Restore shall not be liable for business interruption, loss of profits, loss of revenue, or loss of opportunity.</li>
          </ol>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>20. Force Majeure</h2>
          <p className='mb-3'>Gadget Restore shall not be responsible for delays or inability to perform warranty obligations caused by:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Natural disasters;</li>
            <li>Floods;</li>
            <li>Fires;</li>
            <li>Pandemics;</li>
            <li>Government restrictions;</li>
            <li>Supply chain disruptions;</li>
            <li>Transportation disruptions;</li>
            <li>Events beyond reasonable control.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>21. Governing Law and Jurisdiction</h2>
          <p>This Warranty Policy shall be governed by the laws of India. Any dispute arising from this Warranty Policy shall be subject to the exclusive jurisdiction of the competent courts located in Gurugram, Haryana.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>22. Grievance Redressal</h2>
          <p className='mb-3'>For warranty-related complaints or claims:</p>
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
          <h2 className='text-lg font-bold text-white mb-3'>23. Acceptance</h2>
          <p>By availing any repair service from Gadget Restore, the customer acknowledges that they have read, understood, and agreed to this Limited Warranty Policy and accepts all conditions, exclusions, limitations, and obligations contained herein.</p>
        </section>
      </div>
    </div>
  )
}
