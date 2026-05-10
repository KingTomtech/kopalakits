import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MapPin, MessageCircle, ShoppingCart, Moon, Sun, X, Heart } from 'lucide-react';

const styleVars = `
  :root {
    --champagne-light: #FDF7F0;
    --champagne-mist: #F5EBE0;
    --soft-cream: #FFFCF8;
    --khaki-beige: #D8C3A5;
    --khaki-light: #EADDC6;
    --khaki-dark: #A68A64;
    --dusty-olive: #5E6B3C;
    --dusty-olive-dark: #3F4A26;
    --charcoal-accent: #2E2C2A;
    --primary-btn: #5E6B3C;
  }
  .dark {
    --champagne-light: #1C1B19;
    --champagne-mist: #2A2825;
    --soft-cream: #252321;
    --khaki-beige: #8C7A5E;
    --khaki-light: #6B5A44;
    --khaki-dark: #D4B88A;
    --dusty-olive: #A8B68A;
    --dusty-olive-dark: #C5D4A8;
    --charcoal-accent: #F5F0E8;
  }
`;


const products = [
  
  [
    // ZAMBIAN SUPER LEAGUE (18 PRODUCTS)
    {
        "id": 1,
        "name": "Zanaco FC 2025/26 Home Jersey",
        "price": 550,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Umbro",
        "description": "Red and black striped home jersey for the 2025/26 season.",
        "image": "https://sspark.genspark.ai/cfimages?u1=97FvYVtjkGbePHh77Eo7QYXCKn88RUTKSEMCUx%2Blbl0JpcJ%2Buwqv4BT8WYt%2FwMMiXzVW%2B6lWI1L5ztFrwIzyQjVTN541qcDwNGfrV4t%2FJ8ZdsPWn4KQbnh4khGvmLvAeMZO1c9Hl1oqhGhFz8AyBO9lQ8cBVTTu9R6vr9%2F65EXhOieSDSZ3b2kw5hLLz&u2=Fb4yst6LEuCoUekt&width=2560",
        "source": "Football Kit Archive"
    },
    {
        "id": 2,
        "name": "Nkana FC 2025/26 Home Jersey",
        "price": 500,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Umbro",
        "description": "Classic red and white home jersey, a timeless design for the 2025/26 season.",
        "image": "https://sspark.genspark.ai/cfimages?u1=IpoXI%2BXXe%2BUnjUoYCkriSv2i4XLVKQ1YqBaFguNTxfHS8XzOQin4SupHb8qR92Zkc8QHtYdrHRPnLsN2u8quxndFd%2BkvNlVXOOhyYd4dyVwIYqpkk4PEsxTbzK%2B5rn87blRPFQdM6LCXH8vD2tlBtdfXSBS4d4HYYxDLhy%2FH8Cw3yq8%3D&u2=plCnrxQw6CjoAlbn&width=2560",
        "source": "Umbro UK"
    },
    {
        "id": 3,
        "name": "Power Dynamos 2025/26 Home Jersey",
        "price": 480,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Umbro",
        "description": "Aba Yellow official replica – Umbro kit with Copperbelt Energy sponsor.",
        "image": "https://sspark.genspark.ai/cfimages?u1=pUxQWOFWbEqJxOPkENrPeR6hZU0bL9z6dgIwrOkCBOwcqBipaiY%2BNy5KHvelRTbu24%2Bbl%2FbREQKE%2BEhjik3hl%2Fq2%2FW2xfXcyoF41K5VVSQ%3D%3D&u2=0%2BhN%2Bhijm0beMXdR&width=2560",
        "source": "Power Dynamos FC Official"
    },
    {
        "id": 4,
        "name": "Red Arrows FC 2025/26 Home Jersey",
        "price": 520,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Kappa",
        "description": "Home jersey reflecting the colors and core values of the Zambia Air Force.",
        "image": "https://scontent.fluw1-1.fna.fbcdn.net/v/t39.30808-6/506876423_122207193320279032_5048048058577748548_n.jpg",
        "source": "Red Arrows FC"
    },
    {
        "id": 5,
        "name": "Green Buffaloes FC 2025/26 Home Jersey",
        "price": 490,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Puma",
        "description": "Army-green home jersey representing the Zambian military side.",
        "image": "https://sspark.genspark.ai/cfimages?u1=%2B5n7e%2B4761GoOwx0srR%2BbrSpBwkdnMov%2BQIiI6rkI5zYfzei%2BF4tLmDGJF07dmWwzObfgyiP%2B9AVqowihBLyX%2BOUIheS36D70XoElSLde%2BWNvSDAZ8gYXS1tDAjyyAO01O2oKS6178HMJLjhl3MhnkRiw6iw7NGy0bJuZQ%3D%3D&u2=XYExuCdA9tRY187p&width=2560",
        "source": "Football Kit Archive"
    },
    {
        "id": 6,
        "name": "ZESCO United 2025/26 Home Jersey",
        "price": 580,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Nike",
        "description": "Iconic blue home kit of the Zambian champions.",
        "image": "https://sspark.genspark.ai/cfimages?u1=SH6Hlc7WEhTtZ5qxY2JbDOk7yqzZUz6V239KNDeABVBsJdsiAJeGsEq3aT82C2Lm0l7f2UfdOIfM2NHykPfYVsR%2BVRjYH3mPMJzjE%2BODUnd%2BLGGTvmiiFeIAEaLVt3J4VlJpGRMcVkcWYyFEADab4q52wWVjVySxB%2FG5pg%3D%3D&u2=7Vv%2BLRvoWbV2Qfkj&width=2560",
        "source": "Football Kit Archive"
    },
    {
        "id": 7,
        "name": "Kabwe Warriors 2025/26 Home Jersey",
        "price": 450,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Legea",
        "description": "Green and white stripes, the traditional colors of Kabwe Warriors.",
        "image": "https://www.footballkitarchive.com/static/uploads/kabwe-warriors-2024-25-home-kit.jpg",
        "source": "Football Kit Archive"
    },
    {
        "id": 8,
        "name": "NAPSA Stars 2025/26 Home Jersey",
        "price": 470,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Scimitar",
        "description": "Blue and white jersey of the Lusaka-based club.",
        "image": "https://www.footballkitarchive.com/static/uploads/napsa-stars-2025-26-home-kit.jpg",
        "source": "NAPSA Stars FC"
    },
    {
        "id": 9,
        "name": "Lumwana Radiants 2025/26 Home Jersey",
        "price": 460,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Adidas",
        "description": "Radiant blue home kit inspired by the mining industry.",
        "image": "https://www.footballkitarchive.com/static/uploads/lumwana-radiants-2025-26-home-kit.jpg",
        "source": "Lumwana Radiants"
    },
    {
        "id": 10,
        "name": "Forest Rangers 2025/26 Home Jersey",
        "price": 440,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Macron",
        "description": "Green home jersey representing the Ndola-based club.",
        "image": "https://www.footballkitarchive.com/static/uploads/forest-rangers-fc-2025-home-kit.jpg",
        "source": "Football Kit Archive"
    },
    {
        "id": 11,
        "name": "Mufulira Wanderers 2025/26 Home Jersey",
        "price": 520,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Greenstripes",
        "description": "Classic white and black home kit of 'Mighty' Mufulira Wanderers.",
        "image": "https://www.footballkitarchive.com/static/uploads/mufulira-wanderers-2025-26-home-kit.jpg",
        "source": "Football Kit Archive"
    },
    {
        "id": 12,
        "name": "Kansanshi Dynamos 2025/26 Home Jersey",
        "price": 510,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Nike",
        "description": "Orange and black striped jersey from the Solwezi-based club.",
        "image": "https://www.footballkitarchive.com/static/uploads/kansanshi-dynamos-2025-26-home-kit.jpg",
        "source": "Kansanshi Dynamos"
    },
    {
        "id": 13,
        "name": "Konkola Blades 2025/26 Home Jersey",
        "price": 450,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Umbro",
        "description": "Green and white blades design, official home kit of Konkola Blades.",
        "image": "https://www.footballkitarchive.com/static/uploads/konkola-blades-fc-home-kit.jpg",
        "source": "Football Kit Archive"
    },
    {
        "id": 14,
        "name": "Prison Leopards 2025/26 Home Jersey",
        "price": 430,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Admiral",
        "description": "Yellow and black leopard-print accents home jersey.",
        "image": "https://www.footballkitarchive.com/static/uploads/prison-leopards-2025-26-home-kit.jpg",
        "source": "Football Kit Archive"
    },
    {
        "id": 15,
        "name": "Young Green Eagles 2025/26 Home Jersey",
        "price": 420,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Macron",
        "description": "Light green home jersey for Young Green Eagles.",
        "image": "https://www.footballkitarchive.com/static/uploads/young-green-eagles-2025-26-home-kit.jpg",
        "source": "Young Green Eagles"
    },
    {
        "id": 16,
        "name": "Nkwazi FC 2025/26 Home Jersey",
        "price": 460,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Puma",
        "description": "Blue and white eagle-themed home jersey of Nkwazi.",
        "image": "https://www.footballkitarchive.com/static/uploads/nkwazi-fc-home-kit.jpg",
        "source": "Nkwazi FC"
    },
    {
        "id": 17,
        "name": "Mutondo Stars 2025/26 Home Jersey",
        "price": 440,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Local Brand",
        "description": "Yellow and blue home kit of the promoted side.",
        "image": "https://www.footballkitarchive.com/static/uploads/mutondo-stars-2025-26-home-kit.jpg",
        "source": "Mutondo Stars"
    },
    {
        "id": 18,
        "name": "Atletico Lusaka 2025/26 Home Jersey",
        "price": 450,
        "category": "Local",
        "country": "Zambia",
        "league": "Zambia Super League",
        "brand": "Adidas",
        "description": "Newly promoted club's red and white home jersey.",
        "image": "https://www.footballkitarchive.com/static/uploads/atletico-lusaka-2025-26-home-kit.jpg",
        "source": "Atletico Lusaka"
    },

    // INTERNATIONAL CLUBS (20 PRODUCTS)
    {
        "id": 19,
        "name": "Manchester United 2025/26 Home Jersey",
        "price": 650,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Adidas",
        "description": "Classic red home jersey with modern pattern.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/9d9b3a98e4234739be71b29400b85ddf_9366/Manchester_United_25-26_Home_Jersey_Red_JI7428_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 20,
        "name": "Liverpool FC 2025/26 Home Jersey",
        "price": 750,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Adidas",
        "description": "Liverpool FC home kit in iconic red.",
        "image": "https://images.footballfanatics.com/liverpool/mens-adidas-red-liverpool-2025-26-home-replica-jersey_ss5_p-202728247+pv-1+u-llajwhmkilpkuypqjpnk+v-zmt2pyrlrtt37kgesucj.jpg",
        "source": "Liverpool FC Official Store"
    },
    {
        "id": 21,
        "name": "Arsenal 2025/26 Home Jersey",
        "price": 700,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Adidas",
        "description": "Arsenal home jersey with traditional red and white sleeves.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/2d8c5db94c8d4c4e9b8aaf56010f3b67_9366/Arsenal_25-26_Home_Jersey_Red_JI9517_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 22,
        "name": "Chelsea 2025/26 Home Jersey",
        "price": 680,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Nike",
        "description": "Chelsea blue home kit with advanced moisture-wicking technology.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/chelsea-fc-2025-26-stadium-home-mens-dri-fit-soccer-replica-jersey-ZcCB1C.png",
        "source": "Nike Official Store"
    },
    {
        "id": 23,
        "name": "Manchester City 2025/26 Home Jersey",
        "price": 740,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Puma",
        "description": "Sky blue home jersey of Manchester City.",
        "image": "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/780338/01/sv01/fnd/PNA/fmt/png/Manchester-City-25-26-Home-Replica-Men's-Soccer-Jersey",
        "source": "PUMA Official Store"
    },
    {
        "id": 24,
        "name": "Tottenham Hotspur 2025/26 Home Jersey",
        "price": 690,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Nike",
        "description": "Spurs' white home jersey with navy trim.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/tottenham-hotspur-2025-26-stadium-home-mens-dri-fit-soccer-replica-jersey-Bz6lBN.png",
        "source": "Nike Official Store"
    },
    {
        "id": 25,
        "name": "Aston Villa 2025/26 Home Jersey",
        "price": 600,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Adidas",
        "description": "Claret and blue home jersey of Aston Villa.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/aston-villa-25-26-home-jersey-jn8061.jpg",
        "source": "Aston Villa Official Store"
    },
    {
        "id": 26,
        "name": "West Ham United 2025/26 Home Jersey",
        "price": 620,
        "category": "International",
        "country": "England",
        "league": "Premier League",
        "brand": "Umbro",
        "description": "West Ham's home kit in claret and blue.",
        "image": "https://www.umbro.co.uk/shop/img/whu25-26-home-jersey.jpg",
        "source": "West Ham United Official Store"
    },
    {
        "id": 27,
        "name": "Real Madrid 2025/26 Home Jersey",
        "price": 800,
        "category": "International",
        "country": "Spain",
        "league": "La Liga",
        "brand": "Adidas",
        "description": "All-white Real Madrid home jersey.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/real-madrid-25-26-home-jersey-JJ1931_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 28,
        "name": "Barcelona 2025/26 Home Jersey",
        "price": 780,
        "category": "International",
        "country": "Spain",
        "league": "La Liga",
        "brand": "Nike",
        "description": "Barcelona home kit in their traditional blaugrana stripes.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/fc-barcelona-2025-26-stadium-home-mens-dri-fit-soccer-replica-jersey.png",
        "source": "Nike Official Store"
    },
    {
        "id": 29,
        "name": "Atlético Madrid 2025/26 Home Jersey",
        "price": 720,
        "category": "International",
        "country": "Spain",
        "league": "La Liga",
        "brand": "Nike",
        "description": "Atlético's red and white striped home kit.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/atletico-madrid-2025-26-stadium-home-mens-dri-fit-soccer-replica-jersey-plRSCg.png",
        "source": "Nike Official Store"
    },
    {
        "id": 30,
        "name": "AC Milan 2025/26 Home Jersey",
        "price": 750,
        "category": "International",
        "country": "Italy",
        "league": "Serie A",
        "brand": "Puma",
        "description": "Rossoneri home kit with devil-inspired design.",
        "image": "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/779962/01/mod01/fnd/PNA/fmt/png/AC-Milan-25-26-Home-Replica-Men's-Soccer-Jersey",
        "source": "PUMA Official Store"
    },
    {
        "id": 31,
        "name": "Inter Milan 2025/26 Home Jersey",
        "price": 780,
        "category": "International",
        "country": "Italy",
        "league": "Serie A",
        "brand": "Nike",
        "description": "Inter's home jersey in classic blue and black stripes.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/inter-milan-2025-26-stadium-home-mens-dri-fit-soccer-replica-jersey-BjXsWb.png",
        "source": "Nike Official Store"
    },
    {
        "id": 32,
        "name": "Juventus 2025/26 Home Jersey",
        "price": 760,
        "category": "International",
        "country": "Italy",
        "league": "Serie A",
        "brand": "Adidas",
        "description": "Bianconeri home kit with iconic black and white stripes.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/juventus-25-26-home-jersey-JJ4320_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 33,
        "name": "AS Roma 2025/26 Home Jersey",
        "price": 700,
        "category": "International",
        "country": "Italy",
        "league": "Serie A",
        "brand": "Adidas",
        "description": "Giallorossi home jersey in classic red and yellow.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/as-roma-25-26-home-jersey-JP4184_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 34,
        "name": "Bayern Munich 2025/26 Home Jersey",
        "price": 820,
        "category": "International",
        "country": "Germany",
        "league": "Bundesliga",
        "brand": "Adidas",
        "description": "FC Bayern's iconic red home jersey.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/fc-bayern-25-26-home-jersey-JJ2137_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 35,
        "name": "Borussia Dortmund 2025/26 Home Jersey",
        "price": 780,
        "category": "International",
        "country": "Germany",
        "league": "Bundesliga",
        "brand": "Puma",
        "description": "BVB's yellow and black home kit.",
        "image": "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/780088/01/mod01/fnd/PNA/fmt/png/Borussia-Dortmund-Replica-Home-25-26-Men's-Soccer-Jersey",
        "source": "PUMA Official Store"
    },
    {
        "id": 36,
        "name": "Bayer Leverkusen 2025/26 Home Jersey",
        "price": 750,
        "category": "International",
        "country": "Germany",
        "league": "Bundesliga",
        "brand": "New Balance",
        "description": "Werkself home jersey in red and black.",
        "image": "https://nb.scene7.com/is/image/NB/mt230541hme_nb_02_i?$pdpflexf2$&wid=440&hei=440",
        "source": "New Balance Official Store"
    },
    {
        "id": 37,
        "name": "Paris Saint-Germain 2025/26 Home Jersey",
        "price": 850,
        "category": "International",
        "country": "France",
        "league": "Ligue 1",
        "brand": "Nike",
        "description": "PSG home kit with classic blue, red, and white.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/paris-saint-germain-2025-26-stadium-home-mens-dri-fit-soccer-replica-jersey-SXnr0w.png",
        "source": "Nike Official Store"
    },
    {
        "id": 38,
        "name": "Olympique Lyonnais 2025/26 Home Jersey",
        "price": 720,
        "category": "International",
        "country": "France",
        "league": "Ligue 1",
        "brand": "Adidas",
        "description": "Lyon home kit in traditional white and blue.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/olympique-lyonnais-25-26-home-jersey-JD1396_HM1.jpg",
        "source": "Adidas Official Store"
    },

    // NATIONAL TEAMS (15 PRODUCTS)
    {
        "id": 39,
        "name": "Zambia National Team 2025/26 Home Jersey",
        "price": 600,
        "category": "National",
        "country": "Zambia",
        "league": "International",
        "brand": "Kopa",
        "description": "Zambia's AFCON 2025 home jersey in traditional green with a broken vertical stripe.",
        "image": "https://sspark.genspark.ai/cfimages?u1=1vS%2BGD3cg3TM%2FDd3E%2FRY74VMjsg39kChX69ZBVrelBH59Pf9AfYqdqVYiEo5UnzfVkBldfju1aPRqgACckIzJlMYklwa6P9R8G9S3HaahAa%2Fcx5EhjUx3L6bdYGkv08L4n2%2F8qW3v9taDac9Vr9WxQ%3D%3D&u2=Gx4kLbBR5VIe%2FrAc&width=2560",
        "source": "Football Association of Zambia"
    },
    {
        "id": 40,
        "name": "England National Team 2025/26 Home Jersey",
        "price": 700,
        "category": "National",
        "country": "England",
        "league": "International",
        "brand": "Nike",
        "description": "Three Lions home shirt in classic white.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/england-2026-stadium-home-mens-dri-fit-soccer-replica-jersey.png",
        "source": "Nike Official Store"
    },
    {
        "id": 41,
        "name": "France National Team 2025/26 Home Jersey",
        "price": 780,
        "category": "National",
        "country": "France",
        "league": "International",
        "brand": "Nike",
        "description": "Les Bleus home kit in iconic blue.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/fff-2026-stadium-home-mens-dri-fit-soccer-replica-jersey-T0lfLEZh.png",
        "source": "Nike Official Store"
    },
    {
        "id": 42,
        "name": "Germany National Team 2025/26 Home Jersey",
        "price": 750,
        "category": "National",
        "country": "Germany",
        "league": "International",
        "brand": "Adidas",
        "description": "Die Mannschaft home jersey in classic white.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/germany-26-home-jersey-KD8363_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 43,
        "name": "Spain National Team 2025/26 Home Jersey",
        "price": 740,
        "category": "National",
        "country": "Spain",
        "league": "International",
        "brand": "Adidas",
        "description": "La Roja home kit in classic red.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/spain-26-home-jersey-JN4390_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 44,
        "name": "Italy National Team 2025/26 Home Jersey",
        "price": 720,
        "category": "National",
        "country": "Italy",
        "league": "International",
        "brand": "Adidas",
        "description": "Azzurri home shirt in classic blue.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/italy-26-home-jersey-JL6937_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 45,
        "name": "Netherlands National Team 2025/26 Home Jersey",
        "price": 690,
        "category": "National",
        "country": "Netherlands",
        "league": "International",
        "brand": "Nike",
        "description": "Oranje home kit in iconic orange.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/netherlands-2026-stadium-home-mens-dri-fit-soccer-replica-jersey.png",
        "source": "Nike Official Store"
    },
    {
        "id": 46,
        "name": "Portugal National Team 2025/26 Home Jersey",
        "price": 710,
        "category": "National",
        "country": "Portugal",
        "league": "International",
        "brand": "Puma",
        "description": "Seleção home kit in classic red and green.",
        "image": "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/779190/01/mod01/fnd/PNA/fmt/png/Portugal-2025-Men's-Home-Jersey",
        "source": "PUMA Official Store"
    },
    {
        "id": 47,
        "name": "Belgium National Team 2025/26 Home Jersey",
        "price": 680,
        "category": "National",
        "country": "Belgium",
        "league": "International",
        "brand": "Adidas",
        "description": "Red Devils home kit in classic red.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/belgium-26-home-jersey-JM8381_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 48,
        "name": "Argentina National Team 2025/26 Home Jersey",
        "price": 760,
        "category": "National",
        "country": "Argentina",
        "league": "International",
        "brand": "Adidas",
        "description": "La Albiceleste home kit in blue and white stripes.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/argentina-26-home-jersey-KA8125_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 49,
        "name": "Brazil National Team 2025/26 Home Jersey",
        "price": 800,
        "category": "National",
        "country": "Brazil",
        "league": "International",
        "brand": "Nike",
        "description": "Seleção home kit in iconic yellow with green trim.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/brazil-2026-stadium-home-mens-dri-fit-soccer-replica-jersey.png",
        "source": "Nike Official Store"
    },
    {
        "id": 50,
        "name": "Uruguay National Team 2025/26 Home Jersey",
        "price": 670,
        "category": "National",
        "country": "Uruguay",
        "league": "International",
        "brand": "Puma",
        "description": "La Celeste home kit in classic sky blue.",
        "image": "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/uruguay-2026-home-jersey.png",
        "source": "PUMA Official Store"
    },
    {
        "id": 51,
        "name": "Mexico National Team 2025/26 Home Jersey",
        "price": 710,
        "category": "National",
        "country": "Mexico",
        "league": "International",
        "brand": "Adidas",
        "description": "El Tri home kit in classic green.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/mexico-26-home-jersey-JL8537_HM1.jpg",
        "source": "Adidas Official Store"
    },
    {
        "id": 52,
        "name": "USA National Team 2025/26 Home Jersey",
        "price": 700,
        "category": "National",
        "country": "USA",
        "league": "International",
        "brand": "Nike",
        "description": "Stars and Stripes home kit in white with blue and red.",
        "image": "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/usa-2026-stadium-home-mens-dri-fit-soccer-replica-jersey.png",
        "source": "U.S. Soccer Official Store"
    },
    {
        "id": 53,
        "name": "Japan National Team 2025/26 Home Jersey",
        "price": 680,
        "category": "National",
        "country": "Japan",
        "league": "International",
        "brand": "Adidas",
        "description": "Samurai Blue home kit in classic blue.",
        "image": "https://assets.adidas.com/images/w_600,f_auto,q_auto/japan-26-home-jersey-JZ9688_HM1.jpg",
        "source": "Adidas Official Store"
    }
]
export default function KopalaKits() {
  const [filter, setFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [priceRange, setPriceRange] = useState([300, 500]);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});

  // Load saved data
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const savedDark = localStorage.getItem('darkMode');
    if (savedDark) setDarkMode(JSON.parse(savedDark));
  }, []);

  // Close cart with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleWishlist = (id) => {
    const newList = wishlist.includes(id)
      ? wishlist.filter(i => i !== id)
      : [...wishlist, id];
    setWishlist(newList);
    localStorage.setItem('wishlist', JSON.stringify(newList));
  };

  const filteredProducts = useMemo(() => {
    let result = filter === 'All' ? products : products.filter(p => p.category === filter);
    return result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
  }, [filter, priceRange]);

  const addToCart = useCallback((product) => {
    const size = selectedSizes[product.id] || 'M';
    const qty = quantities[product.id] || 1;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.size === size);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, {
        ...product,
        size,
        quantity: qty,
        cartId: Date.now() + Math.floor(Math.random() * 10000)
      }];
    });

    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  }, [selectedSizes, quantities]);

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, quantity: newQty } : item
    ));
  };

  const sendSingleItemToWhatsApp = (product) => {
    const size = selectedSizes[product.id] || 'M';
    const qty = quantities[product.id] || 1;
    const phone = "260776885851";

    const msg = `Hi Kopala Kits!\n\nI would like to buy:\n• ${product.name}\n• Size: ${size}\n• Quantity: ${qty}\n• Price per unit: K${product.price}\nTotal: K${product.price * qty}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendCartToWhatsApp = () => {
    const phone = "260776885851";
    let msg = "Hi Kopala Kits!\n\nI would like to order:\n\n";

    cart.forEach(item => {
      msg += `• ${item.name} - Size ${item.size} × ${item.quantity} - K${item.price * item.quantity}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    msg += `\nTotal: K${total}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <style>{styleVars}</style>

      <div className="min-h-screen font-sans transition-colors" style={{ backgroundColor: 'var(--champagne-light)', color: 'var(--charcoal-accent)' }}>

        {/* NAVIGATION */}
        <nav className="sticky top-0 z-50 border-b px-4 py-3 flex justify-between items-center shadow-sm" style={{ backgroundColor: 'var(--soft-cream)' }}>
          <h1 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>KOPALA KITS</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* HERO + FILTERS */}
        <header className="text-white px-6 py-12 text-center" style={{ backgroundColor: 'var(--dusty-olive)' }}>
          <h2 className="text-4xl md:text-5xl font-bold">25/26 Season Kits</h2>
          <p className="mt-3 opacity-90">Premium Quality • Copperbelt Delivery</p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['All', 'International', 'Local'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${filter === cat ? 'bg-white text-black shadow' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="mt-6 max-w-md mx-auto px-4">
            <p className="text-sm mb-2">Price Range: K{priceRange[0]} – K{priceRange[1]}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="range"
                min="300"
                max="500"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full accent-[var(--dusty-olive)]"
              />
              <input
                type="range"
                min="300"
                max="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[var(--dusty-olive)]"
              />
            </div>
          </div>
        </header>

        {/* PRODUCT GRID */}
        <main className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const size = selectedSizes[product.id] || 'M';
            const qty = quantities[product.id] || 1;
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div key={product.id} className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[var(--khaki-light)]">
                <div className="relative h-64 bg-gradient-to-br from-amber-50 to-stone-100 dark:from-zinc-800 flex items-center justify-center p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-52 h-52 object-contain transition-transform duration-500 hover:scale-110"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-white"
                  >
                    <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"} />
                  </button>
                </div>

                <div className="p-5">
                  <span className="uppercase text-xs font-bold text-[var(--khaki-dark)]">{product.category}</span>
                  <h3 className="font-bold text-lg mt-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{product.desc}</p>
                  <p className="font-black text-2xl mt-3" style={{ color: 'var(--dusty-olive)' }}>K{product.price}</p>

                  {/* Size Selector */}
                  <div className="mt-4">
                    <p className="text-xs mb-2 font-medium">SIZE</p>
                    <div className="flex gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: s }))}
                          className={`w-9 h-9 rounded-xl text-sm border transition-all ${size === s ? 'bg-[var(--dusty-olive)] text-white' : 'hover:border-gray-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3 mt-5">
                    <span className="text-sm font-medium">Qty</span>
                    <div className="flex border rounded-2xl">
                      <button onClick={() => setQuantities(p => ({ ...p, [product.id]: Math.max(1, (p[product.id] || 1) - 1) }))} className="px-3 py-1">-</button>
                      <span className="px-5 py-1 font-semibold">{qty}</span>
                      <button onClick={() => setQuantities(p => ({ ...p, [product.id]: (p[product.id] || 1) + 1 }))} className="px-3 py-1">+</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => addToCart(product)}
                      className="py-3.5 rounded-2xl border-2 border-[var(--dusty-olive)] font-bold hover:bg-[var(--dusty-olive)] hover:text-white transition"
                    >
                      ADD TO CART
                    </button>
                    <button
                      onClick={() => sendSingleItemToWhatsApp(product)}
                      className="py-3.5 rounded-2xl text-white font-bold"
                      style={{ backgroundColor: 'var(--primary-btn)' }}
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* CART DRAWER */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)} />
            
            <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Cart ({totalItems})</h2>
                <button onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 mt-20">Your cart is empty</p>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className="flex gap-4 border-b pb-6">
                      <img src={item.image} alt={item.name} loading="lazy" className="w-20 h-20 object-contain" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                        <p className="font-bold">K{item.price}</p>

                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}>-</button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 text-sm">Remove</button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t">
                  <div className="flex justify-between text-xl font-bold mb-6">
                    <span>Total</span>
                    <span>K{totalPrice}</span>
                  </div>
                  <button
                    onClick={() => { sendCartToWhatsApp(); setIsCartOpen(false); }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 transition"
                    style={{ backgroundColor: 'var(--primary-btn)' }}
                  >
                    <MessageCircle size={24} /> ORDER VIA WHATSAPP
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="p-8 text-center text-sm border-t" style={{ backgroundColor: 'var(--champagne-light)' }}>
          © 2026 Kopala Kits • Built for the Copperbelt
        </footer>
      </div>
    </>
  );
}
