import { X } from "lucide-react";

interface PrivacyModalProps {
  onClose: () => void;
}

const PrivacyModal = ({ onClose }: PrivacyModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Kebijakan Privasi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Informasi yang Kami Kumpulkan</h3>
              <p className="text-gray-700 mb-4">
                Platform Ketahanan Pangan Untirta mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Informasi akun (nama, email, nomor telepon)</li>
                <li>Data profil pengguna</li>
                <li>Komunikasi dengan tim support</li>
                <li>Data penggunaan platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Bagaimana Kami Menggunakan Informasi</h3>
              <p className="text-gray-700 mb-4">
                Kami menggunakan informasi yang dikumpulkan untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Menyediakan dan memelihara layanan kami</li>
                <li>Meningkatkan pengalaman pengguna</li>
                <li>Mengirimkan komunikasi penting terkait layanan</li>
                <li>Memberikan dukungan pelanggan</li>
                <li>Menganalisis penggunaan platform untuk perbaikan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Keamanan Data</h3>
              <p className="text-gray-700">
                Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi informasi pribadi Anda 
                dari akses, penggunaan, atau pengungkapan yang tidak sah. Namun, tidak ada sistem yang 100% aman, 
                dan kami tidak dapat menjamin keamanan absolut.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Berbagi Informasi</h3>
              <p className="text-gray-700">
                Kami tidak akan menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga 
                tanpa persetujuan Anda, kecuali dalam situasi yang diwajibkan oleh hukum.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Hak Pengguna</h3>
              <p className="text-gray-700 mb-4">
                Anda memiliki hak untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Mengakses dan memperbarui informasi pribadi Anda</li>
                <li>Meminta penghapusan data pribadi</li>
                <li>Menarik persetujuan penggunaan data</li>
                <li>Mengajukan keluhan terkait penggunaan data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Kontak</h3>
              <p className="text-gray-700">
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di:
              </p>
              <div className="bg-green-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@panganjawara.id<br />
                  <strong>Telepon:</strong> 0800-JAWARA<br />
                  <strong>Alamat:</strong> Universitas Sultan Ageng Tirtayasa, Serang, Banten
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
