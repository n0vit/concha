import { ValidatorRewardsPerEpoch } from "./get-rewards-per-epoch";
import { stringify } from "csv";
import DateTime from "moment";
import PDFKit from "pdfkit";
import fs from "fs";
import { forEach } from "lodash";
import Decimal from "decimal.js";

const GWEI_TO_ETH = new Decimal(10).pow(-9);
const parperY = 841.89;
const paperX = 595.28;
const symmaryColumns = ["Epoch", "Total rewards", "Day"];
const detailsColumns = [
  "Epoch",
  "Total rewards",
  "Attestations",
  "Sync Commite",
  "Propser",
  "Block time",
  "Day",
];

export const makeSummaryTable = (
  rewards: Record<string, ValidatorRewardsPerEpoch>[],
  validators: string[],
  type: "csv" | "pdf"
) => {
  validators.forEach((v) => {
    const mappedRewards = rewards
      .map((reward) => ({
        total: reward[v].total,
        epoch: reward[v].epoch,
        date: DateTime.unix(reward[v].timestamp),
      }))
      .filter(Boolean);

    const goupedRewards: Array<{
      total: string;
      date: DateTime.Moment;
      epoch: string;
    }> = [];
    if (mappedRewards.length > 1) {
      let dayTimestamp = mappedRewards[0].date;
      let tmpRewards = {
        total: mappedRewards[0].total,
        epoch: "",
        date: mappedRewards[0].date,
      };
      let tmpEpoch = [mappedRewards[0].epoch];
      for (let mappedReward of mappedRewards.slice(1)) {
        if (dayTimestamp.day() === mappedReward.date.day()) {
          tmpEpoch.push(mappedReward.epoch);
          tmpRewards = {
            total: mappedReward.total + tmpRewards.total,
            epoch: "",
            date: tmpRewards.date,
          };
        } else {
          goupedRewards.push({
            total: GWEI_TO_ETH.mul(tmpRewards.total).toString(),
            date: tmpRewards.date,
            epoch:
              tmpEpoch.length > 1
                ? `${tmpEpoch[0]} - ${tmpEpoch[tmpEpoch.length - 1]}`
                : tmpEpoch[0].toString(),
          });
          tmpRewards = {
            total: mappedReward.total,
            epoch: "",
            date: mappedReward.date,
          };
          tmpEpoch = [mappedReward.epoch];
          dayTimestamp = mappedReward.date;
        }
      }

      if (goupedRewards.length === 0) {
        //add tail if all rewards are on same day
        goupedRewards.push({
          total: GWEI_TO_ETH.mul(tmpRewards.total).toString(),
          date: tmpRewards.date,
          epoch:
            tmpEpoch.length > 1
              ? `${tmpEpoch[0]} - ${tmpEpoch[tmpEpoch.length - 1]}`
              : tmpEpoch[0].toString(),
        });
      } else if (
        goupedRewards[goupedRewards.length - 1].date.day() !==
        dayTimestamp.day()
      ) {
        //add tail tmpRewards if days is different
        goupedRewards.push({
          total: GWEI_TO_ETH.mul(tmpRewards.total).toString(),
          date: tmpRewards.date,
          epoch:
            tmpEpoch.length > 1
              ? `${tmpEpoch[0]} - ${tmpEpoch[tmpEpoch.length - 1]}`
              : tmpEpoch[0].toString(),
        });
      }
    } else if (mappedRewards.length > 0) {
      //add rewards if there is only one
      goupedRewards.push({
        total: GWEI_TO_ETH.mul(mappedRewards[0].total).toString(),
        epoch: mappedRewards[0].epoch.toString(),
        date: mappedRewards[0].date,
      });
    }

    if (type === "csv") {
      const filename = `summary-${v}-${DateTime.utc().day()}.csv`;
      const writableStream = fs.createWriteStream(filename);
      const stringifier = stringify({ header: true, columns: symmaryColumns });

      goupedRewards.forEach((goupedReward) => {
        stringifier.write(
          [
            v,
            goupedReward.epoch,
            goupedReward.total,
            goupedReward.date.format("DD MM YYYY"),
          ],
          (err) => {
            console.log("er", err);
          }
        );
      });

      stringifier.pipe(writableStream);
    }
    if (type === "pdf") {
      console.log("fa", goupedRewards);
      const filename = `summary-${v}-${DateTime.utc().day()}.pdf`;
      const doc = PdfTemplate();
      generateSummaryTable(doc, goupedRewards);
      doc.end();
      doc.pipe(fs.createWriteStream(filename));
      console.log("saved AS", filename);
    }
  });
};
export const makeDetailsTable = (
  rewards: Record<string, ValidatorRewardsPerEpoch>[],
  validators: string[],
  type: "csv" | "pdf"
) => {
  validators.forEach((v) => {
    const mappedRewards = rewards.map((reward) => reward[v]).filter(Boolean);
    const filename = `details-${v}-${DateTime.utc().day()}.${type}`;
    if (type === "csv") {
      const writableStream = fs.createWriteStream(filename);
      const stringifier = stringify({ header: true, columns: symmaryColumns });
      mappedRewards.forEach((reward) => {
        stringifier.write(
          [
            v,
            reward.syncCommitteeReward,
            DateTime.unix(reward.timestamp).format("DD-MM-YYYY"),
          ],
          (err) => {
            console.log("er", err);
          }
        );
        stringifier.pipe(writableStream);
      });
    }
    // if (type === "pdf") {
    //   const doc = PdfTemplate();
    //   generateDetailsTable(doc, mappedRewards);
    //   doc.end();
    //   doc.pipe(fs.createWriteStream(filename));
    // }
  });
};

function PdfTemplate() {
  let doc = new PDFKit({
    size: "A4",
    margins: { top: 30, left: 50, right: 50, bottom: 0 },
  });

  doc
    .image("./src/assets/icons/logo.png", 200, 20, { width: 50 })
    .fillColor("#444444")
    .font("./src/assets/fonts/Gilroy-Semibold.ttf", 32)
    .text("Allnodes", 260, 35)
    .fontSize(24)
    .text("Validator Rewards", 190, 85)
    .moveDown();

  // doc
  //   .rect(0, parperY - 100, paperX, 100)
  //   .fillAndStroke("#eaedef")
  //   .fillColor("#7f8fa4")
  //   .font("./src/assets/fonts/Gilroy-Light.ttf", 12)
  //   .text("Terms of Service", paperX / 2 - 150, parperY - 90, { link: "" })
  //   .text("/", paperX / 2 - 40, parperY - 90)
  //   .text("Cookies Policy", paperX / 2 - 30, parperY - 90)
  //   .text("/", paperX / 2 + 70, parperY - 90)
  //   .text("Privacy Policy", paperX / 2 + 80, parperY - 90);

  return doc;
}

function generateSummaryTable(
  doc: PDFKit.PDFDocument,
  data: { total: string; date: DateTime.Moment; epoch: string }[]
) {
  let i;
  let tableTop = 160;
  doc.font("Helvetica-Bold");
  doc.fillColor("black");
  generateSymmaryTableRow(
    doc,
    tableTop,
    "Epochs",
    "Rewards",
    "Date",
    undefined,
    false
  );
  generateHr(doc, tableTop + 16);
  doc.font("Helvetica");
  let items = data;
  for (i = 0; i < items.length; i++) {
    const item = items[i];
    const position = tableTop + (i + 1) * 22;
    const colors = ["#FFFFFF", "#dbd1d0"];
    generateSymmaryTableRow(
      doc,
      position,
      item.epoch,
      item.total + " ETH",
      item.date.format("DD.MM.YYYY"),
      colors[i % 2 === 0 ? 0 : 1]
    );
    generateHr(
      doc,
      tableTop + 38 + i * 22,
      (items.length >= 50 && i != 0 && i % 7 === 0) || i !== items.length - 1
    );
    if (items.length >= 50 && i != 0 && i % 7 === 0) {
      doc.addPage({ size: "A4", margin: 50 });
      tableTop = 0;
      items = items.slice(i);
      i = 0;
    }
  }

  // const tableBottom = tableTop + 60 + items.length * 20;
  // doc
  //   .rect(300, tableBottom, 250, 100)
  //   .fillAndStroke("#f0f0f0")
  //   .fillColor("black")
  //   .fontSize(14)
  //   .text("Subtotal:", 310, tableBottom + 15, { align: "left" })
  //   .text("23323 IDR", 310, tableBottom + 15, { align: "right" })
  //   .text("Sale %:", 310, tableBottom + 35, { align: "left" })
  //   .text("0", 310, tableBottom + 35, { align: "right" })
  //   .text("Tax:", 310, tableBottom + 55, { align: "left" })
  //   .text("32", 310, tableBottom + 55, { align: "right" })
  //   .lineWidth(250)
  //   .font("Helvetica-Bold")
  //   .fontSize(18)
  //   .text("Total:", 310, tableBottom + 80, { align: "left" })
  //   .text("32", 310, tableBottom + 80, { align: "right" });
}

function generateDetailsTable(
  doc: PDFKit.PDFDocument,
  data: {
    date: string;
    epoch: number;
    attestationSlot: number;
    attestationRewards: number;
    proposerRewards: number;
    syncCommiteeRewards: number;
  }[]
) {
  let i;
  let tableTop = 160;
  doc.font("Helvetica-Bold");
  doc.fillColor("black");
  generateSymmaryTableRow(doc, tableTop, "Epochs", "Rewards", "Date");
  generateHr(doc, tableTop + 16);
  doc.font("Helvetica");
  let items = data;
  for (i = 0; i < items.length; i++) {
    const item = items[i];

    const position = tableTop + (i + 1) * 22;
    const colors = ["#FFC471", "#FFA35D"];
    generateDetailsTableRow(doc, position, item, colors[i % 2 === 0 ? 0 : 1]);
    generateHr(
      doc,
      tableTop + 38 + i * 22,
      (items.length >= 50 && i != 0 && i % 7 === 0) || i !== items.length - 1
    );
    if (items.length >= 50 && i != 0 && i % 7 === 0) {
      doc.addPage({ size: "A4", margin: 50 });
      tableTop = 0;
      items = items.slice(i);
      i = 0;
    }
  }

  // const tableBottom = tableTop + 60 + items.length * 20;
  // doc
  //   .rect(300, tableBottom, 250, 100)
  //   .fillAndStroke("#f0f0f0")
  //   .fillColor("black")
  //   .fontSize(14)
  //   .text("Subtotal:", 310, tableBottom + 15, { align: "left" })
  //   .text("23323 IDR", 310, tableBottom + 15, { align: "right" })
  //   .text("Sale %:", 310, tableBottom + 35, { align: "left" })
  //   .text("0", 310, tableBottom + 35, { align: "right" })
  //   .text("Tax:", 310, tableBottom + 55, { align: "left" })
  //   .text("32", 310, tableBottom + 55, { align: "right" })
  //   .lineWidth(250)
  //   .font("Helvetica-Bold")
  //   .fontSize(18)
  //   .text("Total:", 310, tableBottom + 80, { align: "left" })
  //   .text("32", 310, tableBottom + 80, { align: "right" });
}

function generateHr(
  doc: PDFKit.PDFDocument,
  y: number,
  addHorizontalLine: boolean = true
) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(49, y).lineTo(551, y).stroke();
  if (addHorizontalLine) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(551, y)
      .lineTo(551, y + 22)
      .stroke();

    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(49, y)
      .lineTo(49, y + 22)
      .stroke();
  }
}

function generateSymmaryTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  validator: string,
  rewards: string,
  date: string,
  color: string = "#FFF",
  borders: boolean = true
) {
  doc
    .rect(50, y - 5, 500, 20)
    .fillOpacity(0.6)
    .fillAndStroke(color, color)

    // .fillColor("white", 50)
    .fillColor("black")
    .opacity(1)
    .fontSize(14)
    .text(validator, 50, y, { width: 200 });
  if (borders) generatRightBorder(doc, 190, y);
  doc.text(rewards, 200, y, { width: 275 });
  if (borders) generatRightBorder(doc, 465, y);
  doc.text(date, 475, y, { width: 80, align: "left" });
}

function generatRightBorder(doc: PDFKit.PDFDocument, x: number, y: number) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(x, y - 6)
    .lineTo(x, y + 16)
    .stroke();
}

function generateDetailsTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  rewards: ValidatorRewardsPerEpoch,
  color: string = "#FFF"
) {
  doc
    .rect(50, y - 5, 500, 20)
    .fillOpacity(0.6)
    .fillAndStroke(color, color)

    // .fillColor("white", 50)
    .fillColor("black")
    .opacity(1)
    .fontSize(14)
    .text(rewards.epoch.toString(), 50, y, { width: 50 })
    .text(rewards.attestationSlot.toString(), 100, y, { width: 50 })
    .text(rewards.attestationHeadReward.toString(), 200, y, { width: 275 })
    .text(DateTime.unix(rewards.timestamp).format("hh:mm DD MM YYYY"), 475, y, {
      width: 80,
      align: "left",
    });
}
