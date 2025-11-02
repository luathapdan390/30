
import React, { useState, useCallback } from 'react';
import { GoalFormData } from './types';
import { generateStory, generateAudio } from './services/geminiService';
import { playAudio, createDownloadableWav } from './utils/audioUtils';
import InputField from './components/InputField';
import { AudioIcon, DownloadIcon, GenerateIcon } from './components/Icons';

const App: React.FC = () => {
  const [formData, setFormData] = useState<GoalFormData>({
    date: '',
    name: 'Lê Trường',
    location: 'khách sạn Sheraton, TP Hồ Chí Minh',
    amount: 30000000,
    account: 'BIDV 0157',
    moment: 'tiền về tài khoản ting ting',
    celebrateWith1: 'bạn gái',
    celebrateWith2: 'DN Hồng Nga, chủ tịch Đoàn Mai Ly',
    celebrateWith2Pronoun: 'anh',
    messageTo: 'zoom Liên Minh',
  });
  const [story, setStory] = useState<string>('');
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleGenerateStory = useCallback(async () => {
    setIsLoadingStory(true);
    setStory('');
    setAudioData(null);
    setError(null);
    try {
      const generatedText = await generateStory(formData);
      const mandatoryFooter = "\n\nCảm ơn thầy tài phiệt Eric Lê, chủ tịch Đoàn Mai Ly, chủ tịch Khúc Quang Vương, doanh nhân Hồng Nga, cảm ơn tiềm thức.";
      setStory(generatedText + mandatoryFooter);
    } catch (err) {
      setError('Không thể tạo câu chuyện. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoadingStory(false);
    }
  }, [formData]);

  const handleGenerateAudio = useCallback(async () => {
    if (!story) return;
    setIsLoadingAudio(true);
    setAudioData(null);
    setError(null);
    try {
      const audioBase64 = await generateAudio(story);
      setAudioData(audioBase64);
      playAudio(audioBase64);
    } catch (err) {
      setError('Không thể tạo audio. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [story]);

  const handleDownloadAudio = useCallback(() => {
    if (!audioData) return;
    try {
        createDownloadableWav(audioData, 'BucTranhMucTieu.wav');
    } catch (err) {
        setError('Không thể tải audio. Vui lòng thử lại.');
        console.error(err);
    }
  }, [audioData]);

  const isFormIncomplete = Object.values(formData).some(value => value === '' || value === 0);
  
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(Number(formData.amount) || 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Bức Tranh Mục Tiêu 30 Ngày
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Kiến tạo tương lai rực rỡ của bạn bằng sức mạnh của ngôn từ và AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-purple-300">Nhập thông tin của bạn</h2>
            <div className="space-y-4">
              <InputField label="Ngày đạt mục tiêu" name="date" type="date" value={formData.date} onChange={handleInputChange} />
              <InputField label="Tên của bạn" name="name" placeholder="Ví dụ: Lê Trường" value={formData.name} onChange={handleInputChange} />
              <InputField label="Địa điểm" name="location" placeholder="Ví dụ: Khách sạn Sheraton, TP.HCM" value={formData.location} onChange={handleInputChange} />
              <div>
                <InputField label="Số tiền (VNĐ)" name="amount" type="number" placeholder="Ví dụ: 30000000" value={formData.amount.toString()} onChange={handleInputChange} />
                {formData.amount > 0 && <p className="text-sm text-gray-400 mt-1">Hiển thị: {formattedAmount} VNĐ</p>}
              </div>
              <InputField label="Tài khoản nhận tiền" name="account" placeholder="Ví dụ: BIDV 0157" value={formData.account} onChange={handleInputChange} />
              <InputField label="Khoảnh khắc đạt mục tiêu" name="moment" placeholder="Ví dụ: Tiền về tài khoản ting ting" value={formData.moment} onChange={handleInputChange} />
              <InputField label="Ăn mừng trực tiếp với ai" name="celebrateWith1" placeholder="Ví dụ: Bạn gái" value={formData.celebrateWith1} onChange={handleInputChange} />
              <InputField label="Ai sẽ nhắn tin chúc mừng bạn?" name="celebrateWith2" placeholder="Ví dụ: DN Hồng Nga, chủ tịch Đoàn Mai Ly" value={formData.celebrateWith2} onChange={handleInputChange} />
              <InputField label="Cách họ gọi bạn (trong tin nhắn)" name="celebrateWith2Pronoun" placeholder="Ví dụ: anh, em, sếp..." value={formData.celebrateWith2Pronoun} onChange={handleInputChange} />
              <InputField label="Nhắn tin vào đâu" name="messageTo" placeholder="Ví dụ: Zoom Liên Minh" value={formData.messageTo} onChange={handleInputChange} />
            </div>
            <button
              onClick={handleGenerateStory}
              disabled={isLoadingStory || isFormIncomplete}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
            >
              {isLoadingStory ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang kiến tạo...
                </>
              ) : (
                <>
                  <GenerateIcon />
                  Tạo Bức Tranh
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700 min-h-[300px] flex flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">Bức tranh của bạn</h2>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            {isLoadingStory && (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-400 animate-pulse">AI đang dệt nên câu chuyện thành công của bạn...</p>
              </div>
            )}
            
            {story && !isLoadingStory && (
              <div className="flex-grow flex flex-col">
                <div className="prose prose-invert max-w-none bg-gray-900/50 p-4 rounded-lg overflow-y-auto h-96 flex-grow whitespace-pre-wrap text-gray-300">
                  <p>{story}</p>
                </div>
                 <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button
                        onClick={handleGenerateAudio}
                        disabled={isLoadingAudio}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                    >
                        {isLoadingAudio ? (
                             <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Đang tạo âm thanh...
                            </>
                        ) : (
                            <>
                                <AudioIcon />
                                Nghe Câu Chuyện
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDownloadAudio}
                        disabled={!audioData}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                    >
                       <DownloadIcon />
                       Tải Audio
                    </button>
                </div>
              </div>
            )}

            {!story && !isLoadingStory && (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500">Câu chuyện của bạn sẽ xuất hiện ở đây.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
