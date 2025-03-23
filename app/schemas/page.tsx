import Link from 'next/link';

export default function SchemasPage() {
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
          <Link href="/rewards" className="text-white hover:text-[#c2ff00]">REWARDS</Link>
          <Link href="/schemas" className="text-[#c2ff00] font-bold">SCHEMAS</Link>
        </nav>
        <button className="bg-[#c2ff00] text-black px-4 py-2 font-bold hover:bg-[#a3d600] transition-colors">
          CONNECT WALLET
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow p-8">
        <div className="cyber-container p-8 mb-12 relative overflow-hidden">
          <h2 className="text-5xl font-bold mb-8 text-[#c2ff00]">SCHEMA MARKET</h2>
          <p className="bg-[#c2ff00] text-black p-2 inline-block mb-12">
            COMPUTE YOUR INTERNET PRIVATE DATA INTO ZK ATTESTATION.
          </p>
          
          {/* 검색 바 */}
          <div className="flex mb-12">
            <input 
              type="text" 
              placeholder="Search schemas..." 
              className="flex-grow p-3 bg-black border border-[#c2ff00]/50 text-white focus:outline-none focus:border-[#c2ff00]"
            />
            <button className="bg-[#c2ff00] text-black px-6 py-3 font-bold">검색</button>
          </div>
          
          {/* 스키마 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'GitHub', reward: '12.5 ZK', status: '활성화' },
              { name: 'Twitter', reward: '8.2 ZK', status: '활성화' },
              { name: 'Discord', reward: '10.0 ZK', status: '활성화' },
              { name: 'Telegram', reward: '7.5 ZK', status: '활성화' },
              { name: 'LinkedIn', reward: '15.0 ZK', status: '활성화' },
              { name: 'Gmail', reward: '9.5 ZK', status: '활성화' }
            ].map((schema, index) => (
              <div key={index} className="border border-[#c2ff00]/30 p-6 hover:border-[#c2ff00] transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold group-hover:text-[#c2ff00] transition-colors">{schema.name}</h3>
                  <div className="w-8 h-8 border border-[#c2ff00] flex items-center justify-center">
                    <span className="text-[#c2ff00]">↗</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm opacity-70">리워드:</span>
                  <span className="text-[#c2ff00] font-bold">{schema.reward}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">상태:</span>
                  <span className="text-[#c2ff00]">{schema.status}</span>
                </div>
                <button className="w-full mt-6 border border-[#c2ff00] py-2 text-[#c2ff00] hover:bg-[#c2ff00]/10 transition-colors">
                  증명 생성
                </button>
              </div>
            ))}
          </div>
          
          {/* 로딩 버튼 */}
          <div className="flex justify-center mt-12">
            <button className="border border-[#c2ff00] px-4 py-2 text-[#c2ff00] hover:bg-[#c2ff00]/10 transition-colors flex items-center gap-2">
              <span>더 보기</span>
              <span className="inline-block w-5 h-5 border-t-2 border-[#c2ff00] rounded-full animate-spin"></span>
            </button>
          </div>
          
          {/* 사이버 그래픽 요소 */}
          <div className="hidden md:block absolute -right-20 top-40 w-64 h-64 border border-[#c2ff00]/50">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#c2ff00]"></div>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#c2ff00]"></div>
            <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-[#c2ff00]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#c2ff00]"></div>
          </div>
        </div>
        
        <div className="cyber-container p-8">
          <h3 className="text-2xl font-bold mb-6">인기 스키마</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#c2ff00]/30">
                  <th className="p-3 text-left">스키마</th>
                  <th className="p-3 text-left">유형</th>
                  <th className="p-3 text-left">사용자 수</th>
                  <th className="p-3 text-right">리워드</th>
                  <th className="p-3 text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#c2ff00]/10 hover:bg-[#c2ff00]/5">
                  <td className="p-3 font-bold">GitHub</td>
                  <td className="p-3">소셜</td>
                  <td className="p-3">25,420</td>
                  <td className="p-3 text-right text-[#c2ff00]">12.5 ZK</td>
                  <td className="p-3 text-center">
                    <button className="border border-[#c2ff00] px-2 py-1 text-[#c2ff00] text-sm hover:bg-[#c2ff00]/10">증명</button>
                  </td>
                </tr>
                <tr className="border-b border-[#c2ff00]/10 hover:bg-[#c2ff00]/5">
                  <td className="p-3 font-bold">Twitter</td>
                  <td className="p-3">소셜</td>
                  <td className="p-3">34,987</td>
                  <td className="p-3 text-right text-[#c2ff00]">8.2 ZK</td>
                  <td className="p-3 text-center">
                    <button className="border border-[#c2ff00] px-2 py-1 text-[#c2ff00] text-sm hover:bg-[#c2ff00]/10">증명</button>
                  </td>
                </tr>
                <tr className="border-b border-[#c2ff00]/10 hover:bg-[#c2ff00]/5">
                  <td className="p-3 font-bold">Discord</td>
                  <td className="p-3">소셜</td>
                  <td className="p-3">18,762</td>
                  <td className="p-3 text-right text-[#c2ff00]">10.0 ZK</td>
                  <td className="p-3 text-center">
                    <button className="border border-[#c2ff00] px-2 py-1 text-[#c2ff00] text-sm hover:bg-[#c2ff00]/10">증명</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 