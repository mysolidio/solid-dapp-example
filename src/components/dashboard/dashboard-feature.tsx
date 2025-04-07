import { AppHero } from '../app-layout'
import { SendSolFeature } from './send-sol-feature'

export function DashboardFeature() {
  return (
    <div>
      <AppHero title="gm" subtitle="Hi, I'm a Example dApp for Solid." />
      <div className="container mx-auto p-4">
        {/* <SendSolFeature /> */}
      </div>
    </div>
  )
}
