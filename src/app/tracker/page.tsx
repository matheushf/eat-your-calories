import TrackerClient from './TrackerClient'
import { getFoodItems } from './actions'

export default async function TrackerPage() {
  const { foods, userEmail } = await getFoodItems()
  return <TrackerClient initialFoods={foods} userEmail={userEmail} />
} 