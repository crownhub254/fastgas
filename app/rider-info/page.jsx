'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bike, MapPin, FileText, Truck, ArrowRight, AlertCircle } from 'lucide-react'
import { getDivisions, getDistricts, getCities } from '@/utils/bdLocations'
import toast from 'react-hot-toast'

export default function RiderInfoPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [riderData, setRiderData] = useState(null)

    const [formData, setFormData] = useState({
        vehicleType: '',
        vehicleNumber: '',
        licenseNumber: '',
        division: '',
        district: '',
        area: '',
        street: ''
    })

    const [divisions] = useState(getDivisions())
    const [districts, setDistricts] = useState([])
    const [cities, setCities] = useState([])

    useEffect(() => {
        const storedData = sessionStorage.getItem('riderRegistration')

        if (!storedData) {
            toast.error('Registration data not found. Please register again.')
            router.push('/register')
            return
        }

        try {
            const data = JSON.parse(storedData)
            setRiderData(data)
        } catch (error) {
            console.error('Error parsing rider data:', error)
            toast.error('Invalid registration data. Please register again.')
            router.push('/register')
        }
    }, [router])

    useEffect(() => {
        if (formData.division) {
            const districtList = getDistricts(formData.division)
            setDistricts(districtList)
            setFormData(prev => ({ ...prev, district: '', area: '' }))
            setCities([])
        }
    }, [formData.division])

    useEffect(() => {
        if (formData.division && formData.district) {
            const cityList = getCities(formData.division, formData.district)
            setCities(cityList)
            setFormData(prev => ({ ...prev, area: '' }))
        }
    }, [formData.division, formData.district])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!riderData) {
            toast.error('Registration data not found. Please register again.')
            router.push('/register')
            return
        }

        // Validation
        if (!formData.vehicleType || !formData.vehicleNumber || !formData.licenseNumber) {
            toast.error('Please fill in all vehicle information')
            return
        }

        if (!formData.division || !formData.district || !formData.area || !formData.street) {
            toast.error('Please fill in all address information')
            return
        }

        setIsLoading(true)

        try {
            // Prepare rider data for the riders API
            const completeRiderData = {
                uid: riderData.uid,
                email: riderData.email,
                displayName: riderData.displayName,
                phoneNumber: riderData.phoneNumber,
                photoURL: riderData.photoURL,
                provider: riderData.provider,
                vehicleType: formData.vehicleType,
                vehicleNumber: formData.vehicleNumber.trim(),
                licenseNumber: formData.licenseNumber.trim(),
                address: {
                    division: formData.division,
                    district: formData.district,
                    area: formData.area,
                    street: formData.street.trim()
                }
            }

            console.log('📤 Sending rider data to backend:', completeRiderData)

            // Save to MongoDB via riders/register endpoint
            const saveToast = toast.loading('Saving rider information...')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(completeRiderData)
            })

            toast.dismiss(saveToast)

            if (!response.ok) {
                const errorData = await response.json()
                console.error('❌ Backend error:', errorData)
                toast.error(errorData.error || 'Failed to save rider data')
                setIsLoading(false)
                return
            }

            const data = await response.json()
            console.log('✅ Backend response:', data)

            if (data.success) {
                // Clear session storage
                sessionStorage.removeItem('riderRegistration')

                toast.success('🎉 Rider registration completed successfully!')
                setTimeout(() => {
                    router.push('/dashboard/rider')
                }, 1000)
            } else {
                toast.error(data.error || 'Failed to save rider data')
            }
        } catch (error) {
            console.error('❌ Rider registration error:', error)
            toast.error('Failed to complete registration. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!riderData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center section-padding bg-base-200 py-12">
            <div className="container-custom max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card bg-base-100 shadow-2xl"
                >
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <Bike className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-base-content mb-2">Rider Information</h2>
                        <p className="text-base-content/60">Complete your rider profile to start delivering</p>
                    </div>

                    <div className="mb-6 p-4 bg-info/10 border-2 border-info/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-info mt-0.5" />
                            <div>
                                <p className="text-sm text-base-content">
                                    Welcome, <span className="font-semibold">{riderData.displayName}</span>!
                                    Please provide your vehicle and address information to complete your rider registration.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-lg font-bold text-base-content border-b-2 border-base-300 pb-2">
                                <Truck className="w-5 h-5 text-primary" />
                                <h3>Vehicle Information</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Vehicle Type <span className="text-error">*</span>
                                </label>
                                <select
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                >
                                    <option value="">Select Vehicle Type</option>
                                    <option value="bike">Motorcycle</option>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="car">Car</option>
                                    <option value="van">Van</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Vehicle Number <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                    placeholder="Dhaka Metro Ka-12-3456"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Driving License Number <span className="text-error">*</span>
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                        placeholder="Enter your license number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-lg font-bold text-base-content border-b-2 border-base-300 pb-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                <h3>Address Information</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Division <span className="text-error">*</span>
                                    </label>
                                    <select
                                        name="division"
                                        value={formData.division}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                    >
                                        <option value="">Select Division</option>
                                        {divisions.map(div => (
                                            <option key={div} value={div}>{div}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        District <span className="text-error">*</span>
                                    </label>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.division}
                                        className="w-full px-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Area/Upazila <span className="text-error">*</span>
                                    </label>
                                    <select
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.district}
                                        className="w-full px-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Area</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Street Address <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                        placeholder="House/Road number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span>Completing Registration...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Complete Registration</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
