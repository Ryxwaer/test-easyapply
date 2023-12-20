/**
 * Form.js sends forms to backend
 * @author Adam Baťala
 */

import React, { useState, useEffect, useRef } from "react"
import { Alert, Modal } from "react-bootstrap"
import request from "../utils/request"
import "../styles/Form.scss"

import czStatement from "../statements/cz"
import enStatement from "../statements/en"
import frStatement from "../statements/fr"
import huStatement from "../statements/hu"
import itStatement from "../statements/it"
import neStatement from "../statements/ne"
import poStatement from "../statements/po"
import roStatement from "../statements/ro"
import skStatement from "../statements/sk"

import czMarketing from "../marketings/cz"
import enMarketing from "../marketings/en"
import frMarketing from "../marketings/fr"
import huMarketing from "../marketings/hu"
import itMarketing from "../marketings/it"
import neMarketing from "../marketings/ne"
import poMarketing from "../marketings/po"
import roMarketing from "../marketings/ro"
import skMarketing from "../marketings/sk"

import enLocalization from "../intl/en.json"
import czLocalization from "../intl/cz.json"
import skLocalization from "../intl/sk.json"
import plLocalization from "../intl/pl.json"
import huLocalization from "../intl/hu.json"
import nlLocalization from "../intl/nl.json"
import frLocalization from "../intl/fr.json"
import roLocalization from "../intl/ro.json"

const Form = () => {
    const inputFile = useRef(null);
    const resumeFile = useRef(null);
    const [isBusy, setBusy] = useState(true);
    const [jobReqId, setJobReqId] = useState(null);
    const [question, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [statement, setStatement] = useState(enStatement);
    const [marketing, setMarketing] = useState(enMarketing);
    const [showModal, setShowModal] = useState(false);
    const [showModalMarketing, setShowModalMarketing] = useState(false);
    const [userModel, setUserModel] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
        agreeMarketing: false,
        agreePrivacy: false,
        attachments: [],
        customQuestionAnswer: "",
        linkedIn: "",
        attachmentsNames: "",
        resume: {
            fileName: "",
            fileContent: ""
        }
    });
    const [warningAlert, setWarningAlert] = useState({
        text: '',
        show: false,
    });
    const [successAlert, setSuccessAlert] = useState({
        text: '',
        show: false,
    });
    const [countries, setCountries] = useState([]);
    const [language, setLanguage] = useState("");
    const [localization, setLocalization] = useState(enLocalization);

    useEffect(() => {
        async function fetchData() {
            let queryParams = checkQueryParams(window.location.search.substring(1));
            console.log("jobReqId: " + queryParams.jobReqId);
            console.log("source: " + queryParams.source);
            let userLang = navigator.language || navigator.userLanguage;
            if(userLang !== undefined) {
                console.log("User language: " + userLanguageMap[userLang]);
                await switchLanguage(userLanguageMap[userLang]);
            }
            // check valid url from client
            let url = new URL(window.location.href);
            let path = url.pathname;
            console.log("Path: " + path);
            if (!isValidPath(path)) {
                console.log("isValidPath: " + isValidPath(path));
                setWarningAlert({text: localization.messages.invalidUrl, show: true});
            } else {
                if (!queryParams?.jobReqId) {
                    console.log("No jobReqId found");
                    setWarningAlert({text: localization.messages.badReqNumber, show: true});
                } else {
                    const response = await request.getRequest("/form?jobReqId=" + queryParams.jobReqId + "&source=" + queryParams.source);
                    if(response == null) {
                        setTimeout(() => {
                            setBusy(false);
                            setWarningAlert({text: localization.messages.badUrl, show: true});
                        });
                    }
                }
            }
        }
        fetchData().then(r => {
            console.log("Data successfully loaded: " + r);
        });
    }, []);

    const checkQueryParams = ( queryParamsString ) => {
        const jobReqIdRegex = /jobReqId=(\d+)/;
        const sourceRegex = /source=([^&]+)/;

        const jobReqIdMatch = queryParamsString?.match(jobReqIdRegex);
        const sourceMatch = queryParamsString?.match(sourceRegex);

        const jobReqId = jobReqIdMatch ? jobReqIdMatch[1] : null;
        const source = sourceMatch ? sourceMatch[1] : null;

        console.log(`jobReqId: ${jobReqId}, source: ${source}`);

        return { jobReqId: jobReqId, source: source };
    }

    const userLanguageMap = {
        "en-US": "ENG",
        "sk": "SVK",
        "cs": "CZE",
        "pl": "PLO",
        "hu": "HUN",
        "nl": "NLD",
        "fr": "FRA",
        "ro": "ROU"
    }

    function isValidPath(path) {
        return path === '/easyapply/form' || path === '';
    }

    /**
     * Loads countries by language
     * @param {string} language 
     */
    const loadCountries = async (language) => {
        let localization = "en_GB"
        switch (language){
            case "ENG":
                localization = "en_GB";
                break;
            case "SVK":
                localization = "sk_SK";
                break;
            case "CZE":
                localization = "cs_CZ";
                break;
            case "PLO":
                localization = "pl_PL"
                break;
            case "HUN":
                localization = "hu_HU";
                break;
            case "NLD":
                localization = "nl_NL"
                break;
            case "FRA":
                localization = "fr_FR"
                break;
            case "ROU":
                localization = "ro_RO"
                break;
            default:
                localization = "en_GB";
        }

        const response = await request.getRequest("/form/getCountries/" + localization);
        setCountries(response);
    }

    /**
     * Switches languages
     * @param {string} language 
     */
    const switchLanguage = async (language) => {
        setLanguage(language);
        switch (language){
            case "ENG":
                setLocalization(enLocalization);
                break;
            case "SVK":
                setLocalization(skLocalization);
                break;
            case "CZE":
                setLocalization(czLocalization);
                break;
            case "PLO":
                setLocalization(plLocalization);
                break;
            case "HUN":
                setLocalization(huLocalization);
                break;
            case "NLD":
                setLocalization(nlLocalization);
                break;
            case "FRA":
                setLocalization(frLocalization);
                break;
            case "ROU":
                setLocalization(roLocalization);
                break;
            default:
                setLocalization(enLocalization);
        }
    }

    /**
     * Verifies user form and handles all error messages for user
     */
    const verifyForm = () => {
        const phoneRegex = new RegExp("^[+]?[()/0-9]{9,}$");
        var canSend = true;
        var message = localization.messages.missingDataTitle;
        if (userModel.firstName === '') {
            canSend = false;
            message += localization.messages.fillName;
        }

        if (userModel.lastName === '') {
            canSend = false;
            message += localization.messages.fillLastName;
        }

        if (userModel.phone === '') {
            canSend = false;
            message += localization.messages.fillPhone;
        } else if (userModel.phone !== '' && !phoneRegex.test(userModel.phone)) {
            canSend = false;
            message += localization.messages.badPhone;
        }

        if (userModel.email === '') {
            canSend = false;
            message += localization.messages.fillEmail;
        } else if (userModel.email !== '' && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userModel.email)) {
            canSend = false;
            message += localization.messages.badEmail;
        }

        if (userModel.country === '') {
            canSend = false;
            message += localization.messages.fillCountry
        }

        if (!userModel.agreePrivacy) {
            canSend = false;
            message += localization.messages.agreePrivacy;
        }

        let i = 0
        while (responses.length > i) {
            if (responses[i].required && responses[i].response.length === 0) {
                canSend = false;
                message += localization.messages.badReqNumber;
                break;
            }
            i++;
        }

        if (canSend) {
            const sendResponses = responses.filter(resp => resp.response.length > 0);
            sendForm({
                firstName: userModel.firstName,
                lastName: userModel.lastName,
                phoneNumber: userModel.phone,
                email: userModel.email,
                linkedIn: userModel.linkedIn,
                attachments: userModel.attachments,
                country: userModel.country,
                resume: userModel.resume,
                jobReqId: jobReqId,
                responses: sendResponses,
                marketingConsent: userModel.agreeMarketing
            });
            setWarningAlert({text: "", show: false});
        } else {
            window.scrollTo({
                top: 330,
                left: 0,
                behavior: 'smooth'
            });
            setWarningAlert({text: message, show: true});
        }
    }

    /**
     * Sends completed object to the backend side of app
     * @param {Object} objToSend 
     */
    const sendForm = async (objToSend) => {
        setBusy(true);
        request.postRequest("/form/upsertCandidate", objToSend).then((response) => {
            setBusy(false);
            if (!response || response.status !== "OK") {
                setBusy(false);
                if (response.status === 433) {
                    setWarningAlert({text: `${localization.messages.emailExistsStart} ${userModel.email} ${localization.messages.emailExistsEnd}`, show: true});
                } else if (response.status === 434) {
                    setWarningAlert({text: `${localization.messages.existingUser}`, show: true});
                } else {
                    setWarningAlert({text: localization.messages.error, show: true});
                }
            } else {
                setBusy(false);
                setSuccessAlert({text: localization.messages.applicationSent, show: true});
            }
        });
    }

    /**
     * Handles click on attachment picker select file
     * @param {event} event from attachment picker
     */
    const handleFileUpload = (event) => {
        const { files } = event.target;
        if (files && files.length) {
            var reader = new FileReader();
            for (var i = 0; i < files.length; i++) {
                const file = files[i];
                reader.onload = (e) => {
                    const attachments = userModel.attachments;
                    attachments.push({ fileName: file.name, fileContent: e.target.result});
                    const filesNames = userModel.attachmentsNames.length > 0 ? userModel.attachmentsNames += `, ${file.name}` : file.name;
                    setUserModel(userModel => { return { ...userModel, attachments: attachments, attachmentsNames: filesNames}});
                }
                reader.readAsDataURL(file);
            }
        } else {
            setUserModel(userModel => { return { ...userModel, attachments: [], attachmentsNames: "" }});
        }
    };

    /**
     * Handles click on attachment picker select file
     * @param {event} event from attachment picker
     */
    const handleResumeUpload = (event) => {
        const { files } = event.target;
        if (files && files.length) {
            var reader = new FileReader();
            const file = files[0];
            reader.onload = (e) => {
                setUserModel(userModel => { return { ...userModel, resume: {
                    fileName: file.name,
                    fileContent: e.target.result
                }}});
            }
            reader.readAsDataURL(file);
        } else {
            setUserModel(userModel => { return { ...userModel, resume: {
                fileName: "",
                fileContent: ""
            }}});
        }
    };

    /**
     * Triggers attachment picker to open up
     */
    const onUploadButtonPress = () => {
        inputFile.current.click();
    };

    const changeResponse = (event, index) => {
        const newResponses = [...responses];
        newResponses[index].response = event.target.value;
        setResponses(newResponses);
    }

    /**
     * Sets correct statement language for specifi countries
     * @param event
     */
    const changeCountry = (event) => {
        setUserModel(userModel => { return { ...userModel, country: event.target.value }});
        switch (event.target.value) {
            case "Czech Republic":
                setStatement(czStatement);
                setMarketing(czMarketing)
                break;
            case "France":
                setStatement(frStatement);
                setMarketing(frMarketing);
                break;
            case "Hungary":
                setStatement(huStatement);
                setMarketing(huMarketing);
                break;
            case "Italy":
                setStatement(itStatement);
                setMarketing(itMarketing);
                break;
            case "Netherlands":
                setStatement(neStatement);
                setMarketing(neMarketing);
                break;
            case "Poland":
                setStatement(poStatement);
                setMarketing(poMarketing);
                break;
            case "Romania":
                setStatement(roStatement);
                setMarketing(roMarketing);
                break;
            case "Slovakia":
                setStatement(skStatement);
                setMarketing(skMarketing);
                break;
            default:
                setStatement(enStatement);
                setMarketing(enMarketing);
                break;
        }
    }

    /**
     * Triggers attachment picker to open up
     */
    const onUploadResumeButtonPress = () => {
        resumeFile.current.click();
    };

    return (
        <section id="form" className="section-block">
            <div className="container mt-4 mb-4" style={{display: successAlert.show === true ? "" : "none", background: "none"}}>
                <Alert className="success-alert" variant="success">
                    <p>
                        {successAlert.text}
                    </p>
                </Alert>
            </div>
            <div className="container mt-4 mb-4" style={{display: successAlert.show === true ? "none" : ""}}>
                <div className="indicator" style={{display: isBusy === true ? "" : "none"}}>
                    <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                </div>
                <div className="row language-row me-5 mt-1">
                    <select id="languagePicker" value={language} className="form-select language-select text-muted" onChange={(e) => switchLanguage(e.target.value)}>
                        <option key="ENG" value="ENG">EN</option>
                        <option key="SVK" value="SVK">SK</option>
                        <option key="CZE" value="CZE">CZ</option>
                        <option key="PLO" value="PLO">PL</option>
                        <option key="HUN" value="HUN">HU</option>
                        <option key="NLD" value="NLD">NL</option>
                        <option key="FRA" value="FRA">FR</option>
                        <option key="ROU" value="ROU">RO</option>
                    </select>
                </div>
                <div className="row content-center m-5 mt-2">
                    <div className="content-row alert-holder">
                        <Alert className="warning-alert" variant="warning" style={{display: warningAlert.show === true ? "" : "none"}}>
                            <button type="button" className="closeBtn" onClick={() => setWarningAlert({text: "contact.alert.noData", show: false})}>
                                <i className="fas fa-times"></i>
                            </button>
                            <div className='new-line'>{warningAlert.text}</div>
                        </Alert>
                    </div>
                    <div className="content-row">
                        <div className="row">
                            <div className="col-12 col-lg-6">
                                <label className="input-label">{localization.firstName}</label>
                                <div className="" id="wrapper-name">
                                    <input type="text" onChange={event => setUserModel(userModel => { return { ...userModel, firstName: event.target.value }})} value={userModel.firstName} id="name" placeholder={localization.firstNamePlaceholder} className="medium-input" name="name"/>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6 ">
                                <label className="input-label right-input">{localization.lastName}</label>
                                <div className="" id="wrapper-name">
                                    <input type="text" onChange={event => setUserModel(userModel => { return { ...userModel, lastName: event.target.value }})} value={userModel.lastName} id="lastname" placeholder={localization.lastNamePlaceholder} className="medium-input" name="name"/>
                                </div> 
                            </div>
                        </div>
                    </div>
                    <div className="content-row">
                        <div className="row">
                            <div className="col-12 col-lg-6">
                                <label className="input-label">{localization.phone}</label>
                                <div className="" id="wrapper-name">
                                    <input type="text" onChange={event => setUserModel(userModel => { return { ...userModel, phone: event.target.value }})} value={userModel.phone} id="name" placeholder={localization.phonePlaceholder} className="medium-input" name="name"/>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6">
                                <label className="input-label right-input">{localization.email}</label>
                                <div className="" id="wrapper-name">
                                    <input type="text" onChange={event => setUserModel(userModel => { return { ...userModel, email: event.target.value }})} value={userModel.email} id="lastname" placeholder={localization.emailPlaceholder} className="medium-input" name="name"/>
                                </div> 
                            </div>
                        </div>
                    </div>
                    <div className="content-row">
                        <div className="row">
                            <div className="col-12 col-lg-6">
                                <label className="input-label">{localization.country}</label>
                                <div className="" id="wrapper-name">
                                    <select className="form-select medium-input text-muted" defaultValue={"DEFAULT"} onChange={event => changeCountry(event)}>
                                        <option value="DEFAULT">{localization.countryPlaceholder}</option>
                                        {countries.map((country, key) => {
                                            return <option key={key} value={country.value}>{country.label}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6">
                                <label className="input-label right-input">{localization.linkedIn}</label>
                                <div className="" id="wrapper-name">
                                    <input type="text" onChange={event => setUserModel(userModel => { return { ...userModel, linkedIn: event.target.value }})} value={userModel.linkedIn} id="lastname" placeholder={localization.linkedInPlaceholder} className="medium-input" name="name"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="content-row">
                        <label className="input-label">{localization.resume}</label>
                        <div>
                            <input className="attachment-picker" accept="image/png, image/jpeg, img/jpg, .pdf, .doc, .docx, .txt" ref={resumeFile} onChange={handleResumeUpload} type="file"/>
                            <button id="attachment-trigger" className="attachment-trigger btn" type="file" onClick={() => onUploadResumeButtonPress()}>
                                <div className="text-muted attachments-text">{userModel.resume.fileName !== "" ? userModel.resume.fileName : localization.resumeLabel}</div>
                                <span>{localization.addAttachment}</span>
                            </button>
                        </div>
                    </div>
                    <div className="content-row">
                        <label className="input-label">{localization.other}</label>
                        <div>
                            <input className="attachment-picker" accept="image/png, image/jpeg, img/jpg, .pdf, .doc, .docx, .txt" ref={inputFile} onChange={handleFileUpload} type="file"/>
                            <button id="attachment-trigger" className="attachment-trigger btn" type="file" onClick={() => onUploadButtonPress()}>
                                <div className="text-muted attachments-text">{userModel.attachments.length > 0 ? userModel.attachmentsNames : localization.otherLabel}</div>
                                <span>{localization.addAttachment}</span>
                            </button>
                        </div>
                    </div>
                    {question.map((question, index) => {
                        return (
                        <div key={index} className="content-row">
                            <label className="input-label">{question.title}{question.required ? "*:" : ":"}</label>
                            <div className="" id="wrapper-name">
                                <input type="text" maxLength={question.maxLength} onChange={event => changeResponse(event, index)} value={responses[index].response} id="lastname" placeholder={localization.answer} className="medium-input" name="name"/>
                            </div>
                        </div>
                        )
                    })}
                    <div className="content-row">
                        <label className="input-label">{localization.privacyConsent}</label>
                        <div className="gdpr-label">
                            <input type="checkbox" className="ch" id="grdp-checkbox" onChange={event => setUserModel(userModel => { return { ...userModel, agreePrivacy: event.target.checked }})} />
                            <p className="">
                                {localization.privacyConsentStart} <a className="link" onClick={() => setShowModal(true)}>{localization.privacyConsentLabel}</a> {localization.privacyConsentEnding}
                            </p>
                        </div>
                    </div>
                    <div className="content-row">
                        <label className="input-label">{localization.marketinConsent}</label>
                        <div className="gdpr-label">
                            <input type="checkbox" className="ch" id="grdp-checkbox" onChange={event => setUserModel(userModel => { return { ...userModel, agreeMarketing: event.target.checked }})} />
                            <p className="">
                                {localization.marketinConsentStart} <a className="link" target="_blank" onClick={() => setShowModalMarketing(true)}>{localization.marketinConsentLabel}</a>                 
                            </p>
                        </div>
                    </div>
                    <div className="content-row text-center">
                        {/*<button type="submit" id="back" className="btn send-button button-spacer"
                            name="back">{localization.back}</button>*/}
                        <button type="submit" id="send"
                            className="btn send-button" name="send" onClick={() => verifyForm()}>{localization.apply}</button>
                    </div>
                </div>
                <Modal dialogClassName="statement-modal" aria-labelledby="example-custom-modal-styling-title" scrollable centered show={showModal} animation={false}>
                    <Modal.Header closeButton onClick={() => setShowModal(false)}>
                        <div className="text-center">
                           <h6 className="h3 mb-1 text-center">
                                {localization.privacyConsent}
                           </h6>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center modal-body">
                            {statement}
                        </div>
                    </Modal.Body>
                </Modal>
                <Modal dialogClassName="statement-modal" aria-labelledby="example-custom-modal-styling-title" scrollable centered show={showModalMarketing} animation={false}>
                    <Modal.Header closeButton onClick={() => setShowModalMarketing(false)}>
                        <div className="text-center">
                           <h6 className="h3 mb-1 text-center">
                                {localization.marketinConsent}
                           </h6>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center modal-body">
                            {marketing}
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </section>
    )
}

export default Form