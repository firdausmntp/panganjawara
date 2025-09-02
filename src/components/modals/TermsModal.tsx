import { X } from "lucide-react";

interface TermsModalProps {
  onClose: () => void;
}

const TermsModal = ({ onClose }: TermsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Syarat & Ketentuan</h2>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Penerimaan Syarat</h3>
              <p className="text-gray-700">
                Dengan mengakses dan menggunakan Platform Ketahanan Pangan Untirta ("Platform"), 
                Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju 
                dengan syarat ini, harap tidak menggunakan platform kami.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Definisi Layanan</h3>
              <p className="text-gray-700 mb-4">
                Platform Pangan Jawara menyediakan:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Data dan analitik ketahanan pangan</li>
                <li>Materi edukasi untuk petani dan masyarakat</li>
                <li>Forum komunitas untuk diskusi</li>
                <li>Layanan konsultasi AI</li>
                <li>Informasi kebijakan pangan terkini</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Akun Pengguna</h3>
              <p className="text-gray-700 mb-4">
                Untuk menggunakan fitur tertentu, Anda mungkin perlu membuat akun. Anda bertanggung jawab untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Menjaga keamanan informasi login Anda</li>
                <li>Memberikan informasi yang akurat dan terkini</li>
                <li>Melaporkan penggunaan akun yang tidak sah</li>
                <li>Mematuhi semua aturan komunitas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Penggunaan yang Dilarang</h3>
              <p className="text-gray-700 mb-4">
                Anda dilarang untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Menggunakan platform untuk tujuan ilegal</li>
                <li>Mengirimkan konten yang menyinggung atau tidak pantas</li>
                <li>Mencoba meretas atau merusak sistem</li>
                <li>Menyebarkan informasi palsu atau menyesatkan</li>
                <li>Melanggar hak kekayaan intelektual</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Hak Kekayaan Intelektual</h3>
              <p className="text-gray-700">
                Semua konten, data, dan materi yang tersedia di platform ini adalah milik 
                Universitas Sultan Ageng Tirtayasa atau pemberi lisensi yang berwenang. 
                Penggunaan tanpa izin dilarang keras.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Penafian Tanggung Jawab</h3>
              <p className="text-gray-700">
                Platform ini disediakan "sebagaimana adanya". Kami tidak menjamin keakuratan 
                100% dari semua informasi dan tidak bertanggung jawab atas kerugian yang 
                mungkin timbul dari penggunaan platform ini.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Perubahan Syarat</h3>
              <p className="text-gray-700">
                Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan 
                dinotifikasi melalui platform dan mulai berlaku setelah dipublikasikan.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Hukum yang Berlaku</h3>
              <p className="text-gray-700">
                Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. 
                Setiap perselisihan akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Kontak</h3>
              <p className="text-gray-700">
                Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi:
              </p>
              <div className="bg-green-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@panganjawara.id<br />
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

export default TermsModal;
