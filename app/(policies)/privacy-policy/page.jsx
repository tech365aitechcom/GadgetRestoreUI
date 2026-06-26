'use client'

import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div>
      <h1 className='text-xl lg:text-4xl font-black  mb-3'>GADGET RESTORE PRIVACY POLICY</h1>
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
          <h2 className='text-lg font-bold text-white mb-3'>1. Introduction</h2>
          <p className='mb-3'>Radical Aftermarket Private Limited (“Gadget Restore”, “Company”, “we”, “our”, or “us”) respects your privacy and is committed to protecting your personal information.</p>
          <p className='mb-3'>This Privacy Policy explains how we collect, use, process, store, disclose, and protect personal data when you access our website, customer portal, repair booking platform, walk-in repair services, pickup and drop services, mail-in repair services, customer support channels, and related services.</p>
          <p className='mb-3'>This Privacy Policy is intended to comply with applicable Indian laws including:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Digital Personal Data Protection Act, 2023 (DPDP Act)</li>
            <li>Information Technology Act, 2000</li>
            <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
            <li>Consumer Protection Act, 2019</li>
            <li>Consumer Protection (E-Commerce) Rules, 2020</li>
          </ul>
          <p>By using Gadget Restore services, you consent to the collection and processing of information in accordance with this Privacy Policy.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. Scope of This Policy</h2>
          <p className='mb-3'>This Privacy Policy applies to:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Visitors of gadgetrestore.in</li>
            <li>Customers booking repair services</li>
            <li>Walk-in customers</li>
            <li>Pickup and drop customers</li>
            <li>Mail-in repair customers</li>
            <li>Customer support interactions</li>
            <li>Customer dashboard users</li>
            <li>Service inquiry submissions</li>
            <li>Marketing communication subscribers</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. Information We Collect</h2>
          <h3 className='text-sm font-semibold text-white mt-4 mb-2'>3.1 Information You Provide</h3>
          <p className='mb-3'>We may collect:</p>
          <div className='space-y-3 pl-4 mb-4 border-l-2 border-zinc-700'>
            <div>
              <span className='font-semibold text-white block mb-1'>Identity Information:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Full name</li>
                <li>Contact number</li>
                <li>Email address</li>
                <li>Residential or business address</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Service Information:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Device model</li>
                <li>Device serial number</li>
                <li>IMEI number</li>
                <li>Device condition details</li>
                <li>Service history</li>
                <li>Repair requests</li>
                <li>Service notes</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Billing Information:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Billing address</li>
                <li>GST details (where applicable)</li>
                <li>Payment references</li>
                <li>Invoice details</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Communication Information:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Support tickets</li>
                <li>Email communications</li>
                <li>Service requests</li>
                <li>Feedback and reviews</li>
              </ul>
            </div>
          </div>

          <h3 className='text-sm font-semibold text-white mt-4 mb-2'>3.2 Information Collected Automatically</h3>
          <p className='mb-3'>When you use our website, we may collect:</p>
          <ul className='list-disc pl-5 space-y-1 mb-4 text-zinc-300'>
            <li>IP address</li>
            <li>Browser information</li>
            <li>Device information</li>
            <li>Operating system information</li>
            <li>Website activity logs</li>
            <li>Session information</li>
            <li>Referral information</li>
            <li>Cookie data</li>
          </ul>

          <h3 className='text-sm font-semibold text-white mt-4 mb-2'>3.3 Information Generated During Repairs</h3>
          <p className='mb-3'>We may generate and store:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Diagnostic reports</li>
            <li>Quality control reports</li>
            <li>Device testing reports</li>
            <li>Repair completion records</li>
            <li>Service photographs</li>
            <li>Internal repair logs</li>
            <li>Device inspection records</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>4. Device Data and Customer Content</h2>
          <p className='mb-3'>Customers acknowledge that devices submitted for repair may contain personal information.</p>
          <p className='mb-3'>Gadget Restore does not intentionally access personal customer content except where necessary for:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Device diagnostics</li>
            <li>Functional testing</li>
            <li>Quality assurance</li>
            <li>Repair verification</li>
          </ul>
          <p className='mb-3'>Customers are strongly advised to:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Backup all device data</li>
            <li>Remove sensitive information where possible</li>
            <li>Log out of personal accounts</li>
            <li>Remove SIM cards where feasible</li>
          </ul>
          <p className='mb-3'>Gadget Restore shall not be responsible for:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Loss of customer data</li>
            <li>Corruption of data</li>
            <li>Accidental deletion of data</li>
            <li>Loss of applications</li>
            <li>Loss of contacts</li>
            <li>Loss of media files</li>
            <li>Loss of business information</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>5. Legal Basis for Processing</h2>
          <p className='mb-3'>We process personal information based on:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Customer consent</li>
            <li>Performance of contractual obligations</li>
            <li>Legal and regulatory compliance</li>
            <li>Legitimate business interests</li>
            <li>Fraud prevention and security purposes</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>6. Purposes of Processing</h2>
          <p className='mb-3'>We use personal information to:</p>
          <div className='space-y-3 pl-4 mb-4 border-l-2 border-zinc-700'>
            <div>
              <span className='font-semibold text-white block mb-1'>Service Delivery:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Process repair bookings</li>
                <li>Schedule appointments</li>
                <li>Coordinate pickups and deliveries</li>
                <li>Complete repair services</li>
                <li>Generate invoices</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Customer Support:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Respond to inquiries</li>
                <li>Resolve complaints</li>
                <li>Process warranty claims</li>
                <li>Provide service updates</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Business Operations:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Improve service quality</li>
                <li>Conduct analytics</li>
                <li>Prevent fraud</li>
                <li>Maintain records</li>
                <li>Meet compliance obligations</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Marketing:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Send service-related updates</li>
                <li>Share offers and promotions</li>
                <li>Conduct customer surveys</li>
              </ul>
            </div>
          </div>
          <p>Customers may opt out of marketing communications at any time.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>7. Cookies and Tracking Technologies</h2>
          <p className='mb-3'>We may use:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Essential cookies</li>
            <li>Analytics cookies</li>
            <li>Performance cookies</li>
            <li>Security cookies</li>
          </ul>
          <p className='mb-3'>Cookies help us:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Improve website functionality</li>
            <li>Understand website usage</li>
            <li>Enhance user experience</li>
            <li>Maintain security</li>
          </ul>
          <p>Users may control cookies through browser settings.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>8. Sharing of Information</h2>
          <p className='mb-3'>We do not sell customer personal information.</p>
          <p className='mb-3'>Information may be shared with:</p>
          <div className='space-y-3 pl-4 mb-4 border-l-2 border-zinc-700'>
            <div>
              <span className='font-semibold text-white block mb-1'>Service Providers:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Hosting providers</li>
                <li>Technology vendors</li>
                <li>Payment processors</li>
                <li>IT support providers</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Logistics Partners:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Pickup partners</li>
                <li>Delivery partners</li>
                <li>Courier service providers</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Legal Authorities:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Courts</li>
                <li>Government agencies</li>
                <li>Regulatory authorities</li>
                <li>Law enforcement agencies</li>
              </ul>
            </div>
            <div>
              <span className='font-semibold text-white block mb-1'>Professional Advisors:</span>
              <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
                <li>Auditors</li>
                <li>Legal advisors</li>
                <li>Compliance consultants</li>
              </ul>
            </div>
          </div>
          <p>Information is shared only where necessary and appropriate.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>9. Data Retention</h2>
          <p className='mb-3'>We retain information only for as long as necessary to:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Provide services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce agreements</li>
          </ul>
          <p className='mb-3'>Typical retention periods may include:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li><strong className='text-white'>Service Records:</strong> Up to 8 years</li>
            <li><strong className='text-white'>Invoices and Tax Records:</strong> As required under applicable tax laws</li>
            <li><strong className='text-white'>Warranty Records:</strong> For the warranty period plus applicable record retention requirements</li>
            <li><strong className='text-white'>Website Logs:</strong> As operationally required</li>
          </ul>
          <p>Upon expiry of retention requirements, information may be securely deleted or anonymized.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>10. Data Security</h2>
          <p className='mb-3'>We implement reasonable technical and organizational safeguards including:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Access controls</li>
            <li>Password protection</li>
            <li>Network security measures</li>
            <li>Secure hosting environments</li>
            <li>Role-based access management</li>
            <li>Data backup procedures</li>
            <li>Security monitoring</li>
          </ul>
          <p>While we take reasonable precautions, no system can guarantee absolute security.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>11. Customer Rights</h2>
          <p className='mb-3'>Subject to applicable law, customers may request:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Access to personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of information</li>
            <li>Withdrawal of consent</li>
            <li>Restriction of processing</li>
            <li>Information regarding data processing activities</li>
          </ul>
          <p>Requests may require identity verification.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>12. Third-Party Websites</h2>
          <p className='mb-3'>Our website may contain links to third-party websites.</p>
          <p className='mb-3'>Gadget Restore is not responsible for:</p>
          <ul className='list-disc pl-5 space-y-1 text-zinc-300'>
            <li>Third-party privacy practices</li>
            <li>Third-party content</li>
            <li>Third-party security measures</li>
          </ul>
          <p className='mt-3'>Customers should review third-party privacy policies independently.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>13. Children’s Privacy</h2>
          <p className='mb-3'>Our services are intended for individuals legally capable of entering into contracts under Indian law.</p>
          <p className='mb-3'>We do not knowingly collect personal information from children without appropriate authorization.</p>
          <p>If such information is identified, reasonable efforts will be made to remove it.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>14. Business Transfers</h2>
          <p className='mb-3'>In the event of:</p>
          <ul className='list-disc pl-5 space-y-1 mb-3 text-zinc-300'>
            <li>Merger</li>
            <li>Acquisition</li>
            <li>Business restructuring</li>
            <li>Sale of assets</li>
          </ul>
          <p>Customer information may be transferred as part of the transaction, subject to applicable legal requirements.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>15. International Data Transfers</h2>
          <p className='mb-3'>Our services are primarily operated from India.</p>
          <p>Where service providers process information outside India, appropriate safeguards shall be implemented consistent with applicable law.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>16. Grievance Redressal</h2>
          <p className='mb-3'>For privacy concerns, requests, or complaints, contact:</p>
          <div className='p-4 rounded-xl border text-xs space-y-2' style={{ background: 'rgba(255, 255, 255, 0.01)', borderColor: 'var(--color-content-border)' }}>
            <p className='font-bold text-white'>Mr. Manoj Mahapatra (Grievance Officer)</p>
            <p className='font-semibold text-white'>Radical Aftermarket Private Limited</p>
            <p className='text-zinc-400'>Registered Office: Khasra No. 34/22, Second Floor, NK Tower, Kanhai Road, Sector-45, Gurugram, Haryana – 122003</p>
            <p className='text-zinc-400'>
              Phone: <a href="tel:+918800003785" className="text-accent hover:underline">+91 8800003785</a><br />
              Email: <a href="mailto:support@gadgetrestore.in" className="text-accent hover:underline">support@gadgetrestore.in</a>
            </p>
          </div>
          <p className='mt-3'>We will make reasonable efforts to acknowledge and address complaints within applicable timelines.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>17. Policy Changes</h2>
          <p>We reserve the right to modify this Privacy Policy at any time. Updated versions shall be published on the Website with a revised “Last Updated” date. Continued use of Gadget Restore services following publication of changes constitutes acceptance of the revised Privacy Policy.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>18. Governing Law</h2>
          <p>This Privacy Policy shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or relating to this Privacy Policy shall be subject to the exclusive jurisdiction of the competent courts located in Gurugram, Haryana.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>19. Consent</h2>
          <p>By accessing the Website, booking a service, submitting a device for repair, or using any Gadget Restore service, you acknowledge that you have read, understood, and agreed to this Privacy Policy and consent to the collection, processing, storage, and use of your information as described herein.</p>
        </section>
      </div>
    </div>
  )
}
