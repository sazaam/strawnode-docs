module.exports = {
    nav:`{
        "sections": [
            {
                "id": "1",
                "name": "about",
                "path": "about/",
                "page": {
                    "id": "1",
                    "template": {
                        "behavior": {
                            "@focus": "focus",
                            "@toggle": "toggle"
                        }
                    }
                },
                "children":[
                    {
                        "id": "101",
                        "name": "index",
                        "path": "about/",
                        "page": {
                            "template": {
                                "behavior": {
                                    "@focus": "focus",
                                    "@toggle": "toggle"
                                }
                            }
                        }
                        
                    },
                    {
                        "id": "102",
                        "name": "intro",
                        "path": "about/intro/",
                        "page": {
                            "template": {
                                "behavior": {
                                    "@focus": "focus",
                                    "@toggle": "toggle"
                                }
                            }
                        }
                        
                    }
                ]
            },
            {
                "id": "2",
                "name": "docs",
                "path": "docs/",
                "page": {
                    "id": "2",
                    "template": {
                        "id": "1",
                        "name": "top",
                        "behavior": {
                            "@focus": "focus",
                            "@toggle": "toggle"
                        }
                    }
                },
                "children":[
                    {
                        "id": "301",
                        "name": "guide",
                        "path": "docs/guide/",
                        "page": {
                            "template": {
                                "behavior": {
                                    "@focus": "focus",
                                    "@toggle": "toggle"
                                }
                            }
                        }
                        
                    },
                    {
                        "id": "302",
                        "name": "api",
                        "path": "docs/api/",
                        "page": {
                            "template": {
                                "behavior": {
                                    "@focus": "focus",
                                    "@toggle": "toggle"
                                }
                            }
                        }
                        
                    },
                    {
                        "id": "303",
                        "name": "examples",
                        "path": "docs/examples/",
                        "page": {
                            "template": {
                                "behavior": {
                                    "@focus": "focus",
                                    "@toggle": "toggle"
                                }
                            }
                        },
                        "children":[
                            {
                        
                                "id": "3001",
                                "name": "example_dyn",
                                "path": "docs/examples/[0-9]+",
                                "page": {
                                    "template": {
                                        "behavior": {
                                            "@focus": "focus",
                                            "@toggle": "toggle"
                                        }
                                    }
                                },
                                "children":[
                                    {
                                        "id": "30011",
                                        "name": "detail",
                                        "path": "docs/examples/[0-9]+/detail",
                                        "page": {
                                            "template": {
                                                "behavior": {
                                                    "@focus": "focus",
                                                    "@toggle": "toggle"
                                                }
                                            }
                                        },
                                        "children":[
                                            {
                                                "id": "30011",
                                                "name": "detail_dyn",
                                                "path": "docs/examples/[0-9]+/detail/[0-9]+/",
                                                "page": {
                                                    "template": {
                                                        "behavior": {
                                                            "@focus": "focus",
                                                            "@toggle": "toggle"
                                                        }
                                                    }
                                                }
                                            }
                                            
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "3",
                "name": "download",
                "path": "download/",
                "page": {
                    "id": "3",
                    "template": {
                        "id": "1",
                        "name": "top",
                        "behavior": {
                            "@focus": "focus",
                            "@toggle": "toggle"
                        }
                    }
                }
            }
        ]
    }`,
    footnav:`{
        "footlinks": [
            {
                "name": "Headquarters",
                "children":[
                    {
                        "name":"adress",
                        "content":"MMAI <br />1570 N Batavia St <br />Orange, CA<br />92867<br /><br />",
                        "link":"https://www.google.com/maps/place/1570+N+Batavia+St,+Orange,+CA+92865,+USA/@33.8133542,-117.8654486,17z/data=!3m1!4b1!4m6!3m5!1s0x80dcd7132f0a6335:0x6e67ab10da5663d7!8m2!3d33.8133498!4d-117.8628737!16s%2Fg%2F11c43zsg16?entry=ttu"
                    },
                    {
                        "name":"adress2",
                        "content":"NSLAB <br/>806 Industrial Cooperation Building<br />Daehak-ro Gumi-si, Gyeongsangbuk-do<br />Republic of Korea",
                        "link":"https://www.google.com/maps/place/%EA%B8%88%EC%98%A4%EA%B3%B5%EA%B3%BC%EB%8C%80%ED%95%99%EA%B5%90%EC%82%B0%ED%95%99%ED%98%91%EB%A0%A5%EB%8B%A8/data=!4m9!1m2!2m1!1s806+Industrial+Cooperation+Building+Daehak-ro+Gumi-si,+Gyeongsangbuk-do+Republic+of+Korea!3m5!1s0x3565c793ca4fd273:0x764235116e3debdc!8m2!3d36.14888!4d128.393543!16s%2Fg%2F11hyygvsks?entry=ttu"
                    }
                ]
            },
            {
                "name": "MOU / NDA",
                "children":[
                    {
                        "name":"ictc",
                        "content":"ICT Convergence Research Center"
                    },
                    {
                        "name":"lig",
                        "content":"LIG Nex 1"
                    },
                    {
                        "name":"lg",
                        "content":"LG U+"
                    },
                    {
                        "name":"linux",
                        "content":"Linux Data System"
                    },
                    {
                        "name":"cognitgo",
                        "content":"Cognitgo"
                    },
                    {
                        "name":"philippinecodingcamp",
                        "content":"Philippine Coding Camp"
                    },
                    {
                        "name":"qualcomm",
                        "content":"Qualcomm"
                    },
                    {
                        "name":"ekotek",
                        "content":"Ekotek"
                    },
                    {
                        "name":"pollynwoke",
                        "content":"Polly Nwoke & Co."
                    }
                ]
            },
            {
                "name": "Research",
                "children":[
                    {
                        "name":"patents-and-papers",
                        "content":"Patents and Papers",
                        "link":"/research/",
                        "target":"_self"
                    }
                ]
            },
            {
                "name": "Help",
                "children":[
                    {
                        "name":"faq",
                        "content":"FAQ",
                        "link":"/faq/",
                        "target":"_self"
                    },
                    {
                        "name":"tnc",
                        "content":"Terms and Conditions",
                        "link":"/legal/",
                        "target":"_self"
                    },
                    {
                        "name":"github",
                        "content":"Github"
                    },
                    {
                        "name":"discord",
                        "content":"Discord"
                    }
                ]
            }
        ]
    }`,
    pureseries:`{
        "intro":{
            "title":"Pure Chain Ecosystem",
            "intro":"Pure Series aims to leverage the reliability and innovativeness of blockchain technology to unlock new possibilities across various industries."
        },
        "series":[
            {
                "id":"0",
                "path":"purechain/",
                "name":"#[b.bolder Pure] #[span Chain]",
                "desc":{
                    "title":"Improved Performance over Traditional Blockchains",
                    "content":"We utilize exclusive technologies to addres blockchain challenges (decentralization, security, scalability, high gas fees) and provide a real-time environment."
                },
                "blocks":[
                    {
                        "nickname":"SAM#[sup +]",
                        "title":"Smart Auto Mining#[sup +]",
                        "feature":"A mining technique that optimizes transaction mining time and reduces the energy required to power the network.",
                        "utilizes":"Exchange Module • Orderbook Primitive • Oracle Module"
                    },
                    {
                        "nickname":"PoA#[sup 2]",
                        "title":"Proof of Authority#[sup 2]",
                        "feature":"A tehnique that ensures network stability even when or if mining is interrupted.",
                        "utilizes":"CosmWasm Module • Exchange Module • Orderbook Primitive"
                    },
                    {
                        "nickname":"NSL-L2",
                        "title":"NSL Layer2",
                        "feature":"A technology that uses Zero-Knowledge (Zk)- Rollup technology with SAM+ and PoA2 to improve blockchain stabilityand gas fees. ",
                        "utilizes":"CosmWasm Module • Exchange Module • Orderbook Primitive"
                    },
                    {
                        "nickname":"L1#[sup +]",
                        "title":"Augmented Layer1",
                        "feature":"A layer that integrates SAM+ and PoA2 to enhance both efficiency and reliability of the existing blockchain's Layer1.",
                        "utilizes":"CosmWasm Module • Exchange Module • Orderbook Primitive"
                    },
                    {
                        "nickname":"NSL-cL2",
                        "title":"Centralized Layer2",
                        "feature":"A specialized Layer2 for industrial applications.",
                        "utilizes":"CosmWasm Module • Exchange Module • Orderbook Primitive"
                    }
                ]
            },
            {
                "id":"1",
                "path":"purewallet/",
                "name":"#[b.bolder Pure] #[span Wallet]",
                "desc":{
                    "title":"Offline Transaction",
                    "content":"Technology that increases security and real-time in token-based transactions. Hardware-Free Cold Storage, Strong security, Seamless payments Real-time transaction, Reduce transaction costs"
                },
                "blocks":[
                    {
                        "title":"Offline Token",
                        "feature":"Offline Token for transfer  cryptocurrency data in real-time and without network"
                    },
                    {
                        "title":"Hardware-Free Cold Storage",
                        "feature":"Provides offline token-based software cold storage rather than a general hardware-based cold storage method."
                    },
                    {
                        "title":"Split Token",
                        "feature":"New tokens are registered and  generated within the blockchain,  so they cost gas fee. However,  it provides technology to generate tokens in an off-chain environment"
                    },
                    {
                        "title":"Augmented Layer1",
                        "feature":"A layer that integrates SAM+ and PoA2 to enhance both efficiency and reliability of the existing blockchain's Layer1."
                    },
                    {
                        "title":"Connect",
                        "feature":"Provides connect other Web3.0 application using user wallet information User can experience Web3.0 world with PureWallet."
                    }
                ]
            },
            {
                "id":2,
                "path":"purecontract/",
                "name":"#[b.bolder Pure] #[span Contract]",
                "desc":{
                    "title":"Standard Electronic Contract System Based on Blockchain",
                    "content":"Technology that increases security and real-time in token-based transactions. Blockchain technology-based data processing technology provides transparent and fair contract procedure services by securing the characteristics of electronic, automation, and standardization of the contract system"
                },
                "blocks":[
                    {
                        "title":"Contract",
                        "feature":"Implementation of authentication and electronic signature management for contracts using smart contracts, and use IPFS technology for distributed storage and verification of contract details and history."
                    },
                    {
                        "title":"Automatic contract creation by user input and selection",
                        "feature":"Offer various contract document formats based on standard forms and automatically calculate items like contract amount and period based on user inputs."
                    },
                    {
                        "title":"Ensure fair contract proceedings through mutual consultation between the parties",
                        "feature":"Implementation of a consultation that allows documentation creation and modification to be signed by both parties to the contract only after cross-approval."
                    },
                    {
                        "title":"Final contract forgery verification",
                        "feature":"A layer that integrates SAM+ and PoA2 to enhance both efficiency and reliability of the existing blockchain's Layer1."
                    }
                ]
            },
            {
                "id":"3",
                "path":"purecertificate/",
                "name":"#[b.bolder Pure] #[span Certificate]",
                "desc":{
                    "title":"Robust Originality Guarantee Based on 3 Technologies",
                    "content":"Strong data encryption, creation of original file metadata, and detection of forgery through hash value comparison considering the content and characteristics of the data to ensure the authenticity of the test certificates.#[br]#[br]Exam certificates issued by Pure Certificate are safe to use. NS Lab issues transcripts only with unaltered files and ensuring reliability."
                },
                "blocks":[
                    {
                        "title":"Data Protection",
                        "feature":"Fast and efficient encryption and decryption are achieved through two-way encryption, with data protection enhanced by security level settings."
                    },
                    {
                        "title":"Original File Metadata",
                        "feature":"Guarantees the original's integrity through metadata based on the block hash algorithm."
                    },
                    {
                        "title":"Forgery Detection",
                        "feature":"Forgery detection based on the perceptual hash algorithm. Forgery detection based on the perceptual hash algorithm."
                    }
                ]
            },
            {
                "id":"4",
                "path":"purevoting/",
                "name":"#[b.bolder Pure] #[span Voting]",
                "desc":{
                    "title":"Secure Data Management",
                    "content":"Addresses voter concerns about privacy and ensures anonymity for the fairness of voting. #[br]#[br] Pure Voting converts and stores the votes through NS Lab's blockchain hash algorithm, making data forgery impossible. Multiple networked computer nodes maintain and update the distributed ledger simultaneously, enabling parallel processing and real-time documentation. This collaboration enhances the efficiency and accuracy of the voting system by shortening the processing time for voting results."
                },
                "blocks":[
                    {
                        "title":"Offline Electronic Voting",
                        "feature":"Secure voting in a WLAN based offline environment"
                    },
                    {
                        "title":"Reliable Offline Tokens",
                        "feature":"Enhanced reliability of the election data through blockchain offline transactions."
                    },
                    {
                        "title":"Hybrid Blockchain",
                        "feature":"Enhanced reliability through a private blockchain, preservation of voting results through a public blockchain."
                    }
                ]
            },
            {
                "id":"5",
                "path":"puremedia/",
                "name":"#[b.bolder Pure] #[span Media]",
                "desc":{
                    "title":"Copyright Checks Using Metadata",
                    "content":"Conducts audio similarity checks by extracting unique metadata from audio files and comparing them. #[br]#[br]Blockchain-based metadata disclosure of audio uploaded by users allows users to see the history of modifications and changes to their audio, ensuring audio transparency and determining the time of composition."
                },
                "blocks":[
                    {
                        "title":"Similarity Check",
                        "feature":"Similarity check based on audio metadata."
                    },
                    {
                        "title":"Private Blockchain",
                        "feature":"Enhancing integrity through metadata storage on private blockchain and saving gas fees."
                    },
                    {
                        "title":"Web-Based Data Disclosure",
                        "feature":"Enhanced transparency through the disclosure of block data on a private blockchain."
                    }
                ]
            },
            {
                "id":"6",
                "path":"purerx/",
                "name":"#[b.bolder Pure] #[span RX]",
                "desc":{
                    "title":"An NFT-Prescription Management for Efficient and Secure Healthcare System",
                    "content":"A novel approach that leverages blockchain technology to innovate prescription services. PureRx solves the problems of traditional paper-based prescription systems, and improves efficiency, quality, and security."
                },
                "blocks":[
                    {
                        "title":"Patient-centric Approach",
                        "feature":"Adopt a patient-centric approach to enable patients to directly manage their prescription records and enhance security and privacy."
                    },
                    {
                        "title":"Non-Fungible tokens (NFTs)",
                        "feature":"Non-fungible tokens (NFTs) in Pure Rx give patients ownership and control over their health information, shifting data protection responsibility from centralized entities to individuals, and enhancing data transparency and interoperability."
                    },
                    {
                        "title":"Lightweight Blockchain Technology",
                        "feature":"Introducing lightweight blockchain technology improves cost efficiency and security, and simplifies prescription data management. Adoption of these technologies provides traceability, auditability, and efficient prescription content management."
                    }
                ]
            },
            {
                "id":"7",
                "path":"pureboms/",
                "name":"#[b.bolder Pure] #[span BOMS]",
                "desc":{
                    "title":"Blockchain-enabled Organ #[br]Matching System",
                    "content":"Pure BOMS revolutionizes organ transplants through blockchain-enabled organ matching, ensuring immutable and transparent record keeping of donor-beneficiary pairs. #[br] #[br] Transparency and security define the transplant process by ensuring accountability and integrity, with every step recorded on the blockchain, from donor registration to organ matching."
                },
                "blocks":[
                    {
                        "title":"Blockchain-based systems",
                        "feature":"Conducts audio similarity checks by extracting unique metadata from audio files and comparing them."
                    },
                    {
                        "title":"Smart Contracts",
                        "feature":"Integrate matching algorithms and procedures into smart contracts for immutable and transparent management. #[br]Use SolidCheck to validate the security of the smart contracts."
                    },
                    {
                        "title":"Matching Algorithm",
                        "feature":"Optimal matching is based on donors' and recipients' biological compatibility, considering location, fairness, and registered beneficiaries."
                    },
                    {
                        "title":"Transparency and Traceability",
                        "feature":"All processes, from registration to transplantation, are recorded on the blockchain for complete traceability, with open-source smart contracts available for public verification."
                    },
                    {
                        "title":"Data Privacy",
                        "feature":"Use blockchain addresses to ensure participants' privacy while maintaining transparency. The matching algorithm processes plaintext data with an identity-protecting mechanism."
                    },
                    {
                        "title":"Automated Alerts",
                        "feature":"Automatically send notifications to relevant stakeholders when a suitable match is found."
                    },
                    {
                        "title":"User Interface",
                        "feature":"Web-based applications facilitate user interaction with blockchain smart contracts, offering a user-friendly interface."
                    },
                    {
                        "title":"Integrating Fairness and #[br]Biological Factors",
                        "feature":"Matching considering biological factors (blood type, HLA match, age, organ size, etc.). #[br] Double testing increases the probability of successful transplantation."
                    }
                ]
            }
        ]
    }`,
    wallet_advantages:`{
        "intro":{
            "blocks":[
                {
                    "title":"Why use #[span.purecolor Purewallet] ?",
                    "intro":"#[em Experience] the #[em Future of Digital Transactions] with #[em PureWallet]: #[em Inclusive, Secure, and Convenient]."
                },
                {
                    "title":"Trade with #[span.purecolor Zero gas fees!]",
                    "intro":"Have you ever been disappointed by a large gas fee for a complex transaction? We provide reasonable gas fees even for complex transactions."
                },
                {
                    "title":"#[span.purecolor Super-fast Offline] #[br]transaction speed",
                    "intro":"Still trading slowly offline? Transact at lightning-fast speeds from your offline wallet."
                },
                {
                    "title":"Strong #[span.purecolor Security] #[br]#[span.purecolor without Hardware]",
                    "intro":"Store your cryptocurrencies with utmost security without any hardware devices. Simply use it with your smartphone without any device."
                }  
            ]
        },
        "whys":[
            {
                "name":"token_rights",
                "desc":{
                    "title":"Safe and Secure at any time",
                    "content":"We provide safe financial protection at all times, even offline. Transact easily offline using Bluetooth and QR code."
                }
            },
            {
                "name":"offline_transactions",
                "desc":{
                    "title":"Easy Offline Transactions",
                    "content":"Transfer your cryptocurrency to an offline wallet. You can quickly trade with cryptocurrency created in token form."
                }
            },
            {
                "name":"security",
                "desc":{
                    "title":"Thorough Security and Authentication",
                    "content":"Protect your wallet with data encryption. We provide simple authentication with fingerprint and password."
                }
            },
            {
                "name":"no_device",
                "desc":{
                    "title":"Cold Wallet to Mobile",
                    "content":"With membership, anyone can use Cold Wallet on their mobile phone. Get integrated storage forever with a membership."
                }
            },
            {
                "name":"swap",
                "desc":{
                    "title":"Open Multiple Accounts",
                    "content":"You can open an account anytime, anywhere. Also, easily open extra accounts at no additional cost."
                }
            },
            {
                "name":"property_rights",
                "desc":{
                    "title":"Reasonable Gas Fee",
                    "content":"We optimize transaction processing so you can trade hassle-free. Trade at a reasonable price without any burden."
                }
            }
        ]
    }`
}

