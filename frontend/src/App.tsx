import './App.css'
import AppLayout from './components/app-layout'
import LivekitCli from './components/livekit-cli'
import './userWorker'

function App() {

  return (
    <>
      <AppLayout>
        <LivekitCli />
      </AppLayout>
    </>
  )
}

export default App
