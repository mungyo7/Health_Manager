import Link from 'next/link';

export default function RewardsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* 헤더 */}
      <header className="flex justify-between items-center p-4 border-b border-[#c2ff00]/30">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#c2ff00] mr-4"></div>
          <h1 className="text-xl font-bold text-[#c2ff00]">ZKPASS-PORTAL</h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-white hover:text-[#c2ff00]">HOME</Link>
          <Link href="/rewards" className="text-[#c2ff00] font-bold">REWARDS</Link>
          <Link href="/schemas" className="text-white hover:text-[#c2ff00]">SCHEMAS</Link>
        </nav>
        <button className="bg-[#c2ff00] text-black px-4 py-2 font-bold hover:bg-[#a3d600] transition-colors">
          CONNECT WALLET
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow p-8">
        <div className="cyber-container p-8 mb-12 relative overflow-hidden">
          <h2 className="text-5xl font-bold mb-8 text-[#c2ff00]">REWARDS</h2>
          <p className="bg-[#c2ff00] text-black p-2 inline-block mb-12">CONNECTING THE WALLET TO VIEW YOUR REWARDS.</p>
          
          <div className="flex flex-col md:flex-row gap-12 mt-12">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <h3 className="text-2xl font-bold mr-3">Total Rewards</h3>
                <div className="w-8 h-8 border border-[#c2ff00] flex items-center justify-center text-[#c2ff00]">?</div>
              </div>
              <div className="border border-[#c2ff00]/30 p-6 h-48 flex items-center justify-center">
                <p className="text-3xl text-[#c2ff00]">-- ZK --</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <h3 className="text-2xl font-bold mr-3">Today's Rewards</h3>
                <div className="w-8 h-8 border border-[#c2ff00] flex items-center justify-center text-[#c2ff00]">?</div>
              </div>
              <div className="border border-[#c2ff00]/30 p-6 h-48 flex items-center justify-center">
                <p className="text-3xl text-[#c2ff00]">-- ZK --</p>
              </div>
            </div>
          </div>
          
          {/* 사이버 그래픽 요소 */}
          <div className="hidden md:block absolute -right-20 top-1/2 w-64 h-64 border border-[#c2ff00]/50">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#c2ff00]"></div>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#c2ff00]"></div>
            <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-[#c2ff00]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#c2ff00]"></div>
          </div>
        </div>
        
        <div className="cyber-container p-8">
          <h3 className="text-2xl font-bold mb-6">리워드 히스토리</h3>
          <div className="border border-[#c2ff00]/30 p-4 mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c2ff00]/30">
                  <th className="p-3 text-left">날짜</th>
                  <th className="p-3 text-left">스키마</th>
                  <th className="p-3 text-left">상태</th>
                  <th className="p-3 text-right">리워드</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#c2ff00]/10">
                  <td className="p-3">2023-06-15</td>
                  <td className="p-3">GitHub</td>
                  <td className="p-3 text-[#c2ff00]">완료</td>
                  <td className="p-3 text-right">12.5 ZK</td>
                </tr>
                <tr className="border-b border-[#c2ff00]/10">
                  <td className="p-3">2023-06-14</td>
                  <td className="p-3">Twitter</td>
                  <td className="p-3 text-[#c2ff00]">완료</td>
                  <td className="p-3 text-right">8.2 ZK</td>
                </tr>
                <tr className="border-b border-[#c2ff00]/10">
                  <td className="p-3">2023-06-13</td>
                  <td className="p-3">Discord</td>
                  <td className="p-3 text-yellow-500">대기중</td>
                  <td className="p-3 text-right">-- ZK</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end">
            <button className="border border-[#c2ff00] px-4 py-2 text-[#c2ff00] hover:bg-[#c2ff00]/10 transition-colors">
              모든 리워드 보기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 