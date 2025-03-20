
export default function Register() {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-3xl font-bold text-center mb-4">Kayıt Ol</h2>
                <form>
                    <div className="mb-4">
                        <label htmlFor="name" className="block">Adınız</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full p-2 border rounded-md"
                            placeholder="Adınızı girin"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full p-2 border rounded-md"
                            placeholder="Email adresinizi girin"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full p-2 border rounded-md"
                            placeholder="Şifrenizi girin"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Kayıt Ol
                    </button>
                </form>
            </div>
        </div>
    );
}
