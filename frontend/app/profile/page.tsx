'use client';

import {
    FormEvent,
    useEffect,
    useState
} from 'react';

import AppShell from '@/components/AppShell';
import SecureImage from '@/components/SecureImage';

import { api } from '@/lib/api';
import type { ProfileDetail } from '@/lib/types';


const empty = {
    displayName: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    maritalStatus: '',
    motherTongue: '',
    religion: '',
    community: '',
    country: '',
    state: '',
    city: '',
    education: '',
    occupation: '',
    incomeRange: '',
    diet: '',
    smoking: '',
    drinking: '',
    about: '',
    profileCreatedBy: '',
    visibility: 'PUBLIC'
};


export default function Profile() {

    const [form, setForm] =
        useState<any>(empty);

    const [photos, setPhotos] =
        useState<ProfileDetail['photos']>([]);

    const [msg, setMsg] =
        useState('');

    const [photoError, setPhotoError] =
        useState('');

    const [photoBusy, setPhotoBusy] =
        useState(false);


    useEffect(() => {

        api<ProfileDetail>('/profile/me')
            .then(p => {

                setForm({
                    ...empty,
                    ...p,
                    dateOfBirth:
                        p.dateOfBirth ?? ''
                });

                setPhotos(
                    p.photos ?? []
                );

            })
            .catch(e => {

                setMsg(
                    e instanceof Error
                        ? e.message
                        : 'Unable to load profile.'
                );

            });

    }, []);


    function set(
        key: string,
        value: any
    ) {

        setForm((current: any) => ({
            ...current,
            [key]: value
        }));

    }


    async function save(
        e: FormEvent
    ) {

        e.preventDefault();

        setMsg('');

        try {

            const body = {
                ...form,

                heightCm:
                    form.heightCm
                        ? Number(form.heightCm)
                        : null,

                age: undefined,
                photos: undefined,
                userId: undefined,
                completionPercent: undefined,
                lastActiveAt: undefined,
                primaryPhoto: undefined,
                matchScore: undefined,
                emailVerified: undefined,
                phoneVerified: undefined
            };


            const profile =
                await api<ProfileDetail>(
                    '/profile/me',
                    {
                        method: 'PUT',
                        body:
                            JSON.stringify(body)
                    }
                );


            setForm({
                ...empty,
                ...profile,
                dateOfBirth:
                    profile.dateOfBirth ?? ''
            });


            setPhotos(
                profile.photos ?? []
            );


            setMsg(
                `Saved. Profile is ${profile.completionPercent}% complete.`
            );

        } catch (e) {

            setMsg(
                e instanceof Error
                    ? e.message
                    : 'Unable to save profile.'
            );

        }

    }


    async function refreshPhotos() {

        const profile =
            await api<ProfileDetail>(
                '/profile/me'
            );

        setPhotos(
            profile.photos ?? []
        );

    }


    async function upload(
        file: File
    ) {

        setPhotoError('');

        if (photos.length >= 6) {

            setPhotoError(
                'You can upload a maximum of 6 photos.'
            );

            return;
        }


        try {

            setPhotoBusy(true);


            const formData =
                new FormData();


            formData.append(
                'file',
                file
            );


            await api(
                '/photos',
                {
                    method: 'POST',
                    body: formData
                }
            );


            await refreshPhotos();

        } catch (e) {

            setPhotoError(
                e instanceof Error
                    ? e.message
                    : 'Unable to upload photo.'
            );

        } finally {

            setPhotoBusy(false);

        }

    }


    async function primary(
        id: string
    ) {

        try {

            setPhotoError('');
            setPhotoBusy(true);


            await api(
                `/photos/${id}/primary`,
                {
                    method: 'PATCH'
                }
            );


            await refreshPhotos();

        } catch (e) {

            setPhotoError(
                e instanceof Error
                    ? e.message
                    : 'Unable to set primary photo.'
            );

        } finally {

            setPhotoBusy(false);

        }

    }


    async function remove(
        id: string
    ) {

        const shouldDelete =
            confirm(
                'Delete this photo?'
            );


        if (!shouldDelete) {
            return;
        }


        try {

            setPhotoError('');
            setPhotoBusy(true);


            await api(
                `/photos/${id}`,
                {
                    method: 'DELETE'
                }
            );


            await refreshPhotos();

        } catch (e) {

            setPhotoError(
                e instanceof Error
                    ? e.message
                    : 'Unable to delete photo.'
            );

        } finally {

            setPhotoBusy(false);

        }

    }


    async function changePhotoVisibility(
        id: string,
        visibility: string
    ) {

        try {

            setPhotoError('');
            setPhotoBusy(true);


            await api(
                `/photos/${id}/visibility?visibility=${encodeURIComponent(
                    visibility
                )}`,
                {
                    method: 'PATCH'
                }
            );


            await refreshPhotos();

        } catch (e) {

            setPhotoError(
                e instanceof Error
                    ? e.message
                    : 'Unable to update photo visibility.'
            );

        } finally {

            setPhotoBusy(false);

        }

    }


    async function movePhoto(
        index: number,
        direction: -1 | 1
    ) {

        const target =
            index + direction;


        if (
            target < 0 ||
            target >= photos.length
        ) {

            return;

        }


        const reordered =
            [...photos];


        [
            reordered[index],
            reordered[target]
        ] = [
                reordered[target],
                reordered[index]
            ];


        try {

            setPhotoError('');
            setPhotoBusy(true);


            const updated =
                await api<
                    ProfileDetail['photos']
                >(
                    '/photos/reorder',
                    {
                        method: 'PATCH',

                        body:
                            JSON.stringify({
                                photoIds:
                                    reordered.map(
                                        photo =>
                                            photo.id
                                    )
                            })
                    }
                );


            setPhotos(updated);

        } catch (e) {

            setPhotoError(
                e instanceof Error
                    ? e.message
                    : 'Unable to reorder photos.'
            );

        } finally {

            setPhotoBusy(false);

        }

    }


    return (

        <AppShell
            title="My profile"
            subtitle="Keep your information current so matches can understand who you are."
        >

            <div className="profile-editor">


                {/* ========================= */}
                {/* PROFILE DETAILS */}
                {/* ========================= */}


                <form
                    className="panel form"
                    onSubmit={save}
                >

                    <div className="panel-head">

                        <h2>
                            Profile details
                        </h2>


                        <button
                            className="primary-btn"
                            type="submit"
                        >
                            Save profile
                        </button>

                    </div>


                    <div className="form-grid">


                        <Field
                            label="Display name"
                            value={
                                form.displayName
                            }
                            onChange={value =>
                                set(
                                    'displayName',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Date of birth"
                            type="date"
                            value={
                                form.dateOfBirth
                            }
                            onChange={value =>
                                set(
                                    'dateOfBirth',
                                    value
                                )
                            }
                        />


                        <Select
                            label="Gender"
                            value={
                                form.gender ?? ''
                            }
                            onChange={value =>
                                set(
                                    'gender',
                                    value
                                )
                            }
                            options={[
                                '',
                                'MALE',
                                'FEMALE',
                                'NON_BINARY',
                                'OTHER'
                            ]}
                        />


                        <Field
                            label="Height (cm)"
                            type="number"
                            value={
                                form.heightCm ?? ''
                            }
                            onChange={value =>
                                set(
                                    'heightCm',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Marital status"
                            value={
                                form.maritalStatus ?? ''
                            }
                            onChange={value =>
                                set(
                                    'maritalStatus',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Mother tongue"
                            value={
                                form.motherTongue ?? ''
                            }
                            onChange={value =>
                                set(
                                    'motherTongue',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Religion"
                            value={
                                form.religion ?? ''
                            }
                            onChange={value =>
                                set(
                                    'religion',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Community"
                            value={
                                form.community ?? ''
                            }
                            onChange={value =>
                                set(
                                    'community',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Country"
                            value={
                                form.country ?? ''
                            }
                            onChange={value =>
                                set(
                                    'country',
                                    value
                                )
                            }
                        />


                        <Field
                            label="State"
                            value={
                                form.state ?? ''
                            }
                            onChange={value =>
                                set(
                                    'state',
                                    value
                                )
                            }
                        />


                        <Field
                            label="City"
                            value={
                                form.city ?? ''
                            }
                            onChange={value =>
                                set(
                                    'city',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Education"
                            value={
                                form.education ?? ''
                            }
                            onChange={value =>
                                set(
                                    'education',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Occupation"
                            value={
                                form.occupation ?? ''
                            }
                            onChange={value =>
                                set(
                                    'occupation',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Income range"
                            value={
                                form.incomeRange ?? ''
                            }
                            onChange={value =>
                                set(
                                    'incomeRange',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Diet"
                            value={
                                form.diet ?? ''
                            }
                            onChange={value =>
                                set(
                                    'diet',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Smoking"
                            value={
                                form.smoking ?? ''
                            }
                            onChange={value =>
                                set(
                                    'smoking',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Drinking"
                            value={
                                form.drinking ?? ''
                            }
                            onChange={value =>
                                set(
                                    'drinking',
                                    value
                                )
                            }
                        />


                        <Field
                            label="Profile created by"
                            value={
                                form.profileCreatedBy ??
                                ''
                            }
                            onChange={value =>
                                set(
                                    'profileCreatedBy',
                                    value
                                )
                            }
                        />


                        <Select
                            label="Profile visibility"
                            value={
                                form.visibility ??
                                'PUBLIC'
                            }
                            onChange={value =>
                                set(
                                    'visibility',
                                    value
                                )
                            }
                            options={[
                                'PUBLIC',
                                'MEMBERS',
                                'HIDDEN'
                            ]}
                        />


                        <div className="field full">

                            <label>
                                About me
                            </label>


                            <textarea
                                maxLength={3000}
                                value={
                                    form.about ?? ''
                                }
                                onChange={e =>
                                    set(
                                        'about',
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {msg && (

                        <div className="form-message success">
                            {msg}
                        </div>

                    )}

                </form>



                {/* ========================= */}
                {/* PHOTO MANAGER */}
                {/* ========================= */}


                <aside className="panel">

                    <div className="panel-head">

                        <div>

                            <h3>
                                Photos
                            </h3>


                            <p className="muted">
                                {photos.length}/6 photos
                                {' · '}
                                JPEG, PNG or WebP
                                {' · '}
                                up to 10 MB
                            </p>

                        </div>

                    </div>


                    {photoError && (

                        <div className="form-message error">

                            {photoError}

                        </div>

                    )}


                    <label
                        className="secondary-btn"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            marginBottom: 14,

                            opacity:
                                photos.length >= 6 ||
                                    photoBusy
                                    ? 0.5
                                    : 1,

                            cursor:
                                photos.length >= 6 ||
                                    photoBusy
                                    ? 'not-allowed'
                                    : 'pointer'
                        }}
                    >

                        {photoBusy
                            ? 'Working...'
                            : photos.length >= 6
                                ? 'Maximum 6 photos'
                                : 'Add photo'}


                        <input
                            type="file"

                            accept="image/jpeg,image/png,image/webp"

                            hidden

                            disabled={
                                photos.length >= 6 ||
                                photoBusy
                            }

                            onChange={
                                async e => {

                                    const file =
                                        e.target
                                            .files?.[0];


                                    if (file) {

                                        await upload(
                                            file
                                        );

                                    }


                                    e.target.value = '';

                                }
                            }
                        />

                    </label>



                    <div className="photo-grid">

                        {photos.map(
                            (photo, index) => (

                                <div
                                    className="photo-tile"
                                    key={photo.id}
                                >


                                    {/* PHOTO */}


                                    <div
                                        style={{
                                            position:
                                                'relative'
                                        }}
                                    >

                                        <SecureImage
                                            path={photo.url}
                                            alt={
                                                `Profile photo ${index + 1
                                                }`
                                            }
                                        />


                                        {photo.primary && (

                                            <span
                                                style={{
                                                    position:
                                                        'absolute',

                                                    top: 8,
                                                    left: 8,

                                                    background:
                                                        'white',

                                                    padding:
                                                        '4px 8px',

                                                    borderRadius:
                                                        20,

                                                    fontSize:
                                                        12,

                                                    fontWeight:
                                                        700
                                                }}
                                            >

                                                ★ Primary

                                            </span>

                                        )}

                                    </div>



                                    {/* PRIMARY + ORDER */}


                                    <div className="photo-controls">

                                        <button
                                            type="button"

                                            disabled={
                                                photo.primary ||
                                                photoBusy
                                            }

                                            onClick={() =>
                                                primary(
                                                    photo.id
                                                )
                                            }
                                        >

                                            {photo.primary
                                                ? 'Primary'
                                                : 'Make primary'}

                                        </button>


                                        <button
                                            type="button"

                                            title="Move left"

                                            disabled={
                                                index === 0 ||
                                                photoBusy
                                            }

                                            onClick={() =>
                                                movePhoto(
                                                    index,
                                                    -1
                                                )
                                            }
                                        >

                                            ←

                                        </button>


                                        <button
                                            type="button"

                                            title="Move right"

                                            disabled={
                                                index ===
                                                photos.length -
                                                1 ||
                                                photoBusy
                                            }

                                            onClick={() =>
                                                movePhoto(
                                                    index,
                                                    1
                                                )
                                            }
                                        >

                                            →

                                        </button>

                                    </div>



                                    {/* VISIBILITY */}


                                    <div
                                        style={{
                                            marginTop: 8
                                        }}
                                    >

                                        <label
                                            className="muted"

                                            style={{
                                                display:
                                                    'block',

                                                marginBottom:
                                                    4
                                            }}
                                        >

                                            Who can see this photo?

                                        </label>


                                        <select
                                            value={
                                                photo.visibility
                                            }

                                            disabled={
                                                photoBusy
                                            }

                                            onChange={e =>
                                                changePhotoVisibility(
                                                    photo.id,
                                                    e.target.value
                                                )
                                            }

                                            style={{
                                                width: '100%'
                                            }}
                                        >

                                            <option value="PUBLIC">
                                                Everyone
                                            </option>


                                            <option value="CONNECTIONS">
                                                Connections only
                                            </option>


                                            <option value="PRIVATE">
                                                Only me
                                            </option>

                                        </select>

                                    </div>



                                    {/* DELETE */}


                                    <button
                                        type="button"

                                        className="danger-btn"

                                        disabled={
                                            photoBusy
                                        }

                                        style={{
                                            width: '100%',
                                            marginTop: 8
                                        }}

                                        onClick={() =>
                                            remove(
                                                photo.id
                                            )
                                        }
                                    >

                                        Delete

                                    </button>

                                </div>

                            )
                        )}

                    </div>


                    {!photos.length && (

                        <div className="empty">

                            No photos uploaded yet.

                        </div>

                    )}

                </aside>

            </div>

        </AppShell>

    );

}



/* ========================================================= */
/* FORM FIELD */
/* ========================================================= */


function Field({
    label,
    value,
    onChange,
    type = 'text'
}: {
    label: string;
    value: string | number;
    onChange: (
        value: string
    ) => void;
    type?: string;
}) {

    return (

        <div className="field">

            <label>
                {label}
            </label>


            <input
                type={type}

                value={
                    value ?? ''
                }

                onChange={e =>
                    onChange(
                        e.target.value
                    )
                }
            />

        </div>

    );

}



/* ========================================================= */
/* SELECT FIELD */
/* ========================================================= */


function Select({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
    options: string[];
}) {

    return (

        <div className="field">

            <label>
                {label}
            </label>


            <select
                value={
                    value ?? ''
                }

                onChange={e =>
                    onChange(
                        e.target.value
                    )
                }
            >

                {options.map(
                    option => (

                        <option
                            key={
                                option || 'blank'
                            }
                            value={option}
                        >

                            {option ||
                                'Select'}

                        </option>

                    )
                )}

            </select>

        </div>

    );

}