import { useNavigate } from 'react-router-dom'
import styles from './PayLeagueFeePage.module.css'

const PAYOUTS = [
  { place: '1st Place', share: '30%' },
  { place: '2nd Place', share: '20%' },
  { place: '3rd Place', share: '15%' },
  { place: '4th – 10th Place', share: '5% each' },
]

function PayLeagueFeePage() {
  const navigate = useNavigate()

  return (
    <div className={styles.payPage}>
      <div className={styles.header}>
        <button onClick={() => navigate('/')}>&larr; Back to Seasons</button>
        <h1>Pay League Fee</h1>
      </div>

      <p className={styles.intro}>
        Each season, the league fee is <strong>$10</strong>. All fees collected go into the prize pool and are paid
        out at the end of the season:
      </p>

      <ul className={styles.payoutList}>
        {PAYOUTS.map((payout) => (
          <li key={payout.place}>
            <span>{payout.place}</span>
            <span className={styles.share}>{payout.share}</span>
          </li>
        ))}
      </ul>

      <div className={styles.qrCard}>
        <img src="/venmo-qr.png" alt="Venmo QR code for Michael Doom (@Michael-Doom-1)" className={styles.qrImage} />
        <p className={styles.qrCaption}>Scan with your phone's camera to pay via Venmo</p>
        <a
          className={styles.venmoLink}
          href="https://venmo.com/Michael-Doom-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Or open @Michael-Doom-1 on Venmo
        </a>
      </div>
    </div>
  )
}

export default PayLeagueFeePage
