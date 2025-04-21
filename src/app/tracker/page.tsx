import { getFoodsAndSession } from '../actions/food'
import TrackerClient from './TrackerClient'

export default async function TrackerPage() {
  const { foods, session } = await getFoodsAndSession()
  return <TrackerClient initialFoods={foods} userEmail={session?.user.email} />
} 