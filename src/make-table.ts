import { ValidatorRewardsPerEpoch } from "./get-rewards-per-epoch";
import { stringify } from "csv";
import DateTime from "moment";
import PDFKit from "pdfkit";
import fs from "fs";

const parperY = 841.89;
const paperX = 595.28;
const symmaryColumns = ["Validator", "Epoch", "Total rewards", "Day"];
const datailsColumns = [
  "Validator",
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
    const mappedRewards = rewards.map((reward) => reward[v]).filter(Boolean);
    if (type === "csv") {
      const filename = `summary-${v}-${DateTime.utc().day()}.csv`;
      const writableStream = fs.createWriteStream(filename);
      const stringifier = stringify({ header: true, columns: symmaryColumns });
      mappedRewards.forEach((reward) => {
        stringifier.write(
          [
            v,
            reward.epoch,
            reward.total,
            DateTime.unix(reward.timestamp).format("DD MM YYYY"),
          ],
          (err) => {
            console.log("er", err);
          }
        );
      });

      stringifier.pipe(writableStream);
    }
    if (type === "pdf") {
      const filename = `summary-${v}-${DateTime.utc().day()}.pdf`;
      const doc = PdfTemplate();
      generateTable(doc, [
        {
          rewards: 129,
          date: 1710198829,
          epoch: [
            1, 45, 45, 23, 56, 67, 67, 78, 34, 23, 56, 78, 354, 56, 67, 46,
          ],
        },
      ]);
      doc.end();
      doc.pipe(fs.createWriteStream(filename));

      //   const writableStream = fs.createWriteStream(filename);
      //   const stringifier = stringify({ header: true, columns: symmaryColumns });
      //   mappedRewards.forEach((reward) => {
      //     stringifier.write(
      //       [
      //         v,
      //         reward.total,
      //         DateTime.unix(reward.timestamp).format("DD MM YYYY"),
      //       ],
      //       (err) => {
      //         console.log("er", err);
      //       }
      //     );
      //   });

      //   stringifier.pipe(writableStream);
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
    const filename = `details-${v}-${DateTime.utc().day()}.csv`;
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
    });

    stringifier.pipe(writableStream);
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

function generateTable(
  doc: PDFKit.PDFDocument,
  data: { rewards: number; date: number; epoch: Array<number> }[]
) {
  let i;
  let tableTop = 160;
  doc.font("Helvetica-Bold");
  doc.fillColor("black");
  generateSymmaryTableRow(doc, tableTop, "Epochs", "Rewards", "Date");
  generateHr(doc, tableTop + 20);
  doc.font("Helvetica");
  let items = data;
  for (i = 0; i < items.length; i++) {
    const item = items[i];
    const position = tableTop - 24 + (i + 1) * 50;
    const colors = ["#FFC471", "#FFA35D"];
    generateSymmaryTableRow(
      doc,
      position,
      `${item.epoch[0]}-${item.epoch[item.epoch.length - 1]}`,
      item.rewards.toString() + "Gwei",
      DateTime.unix(item.date).format("DD MM YYYY"),
      colors[i % 2 === 0 ? 0 : 1]
    );
    if (items.length >= 5 && i != 0 && i % 7 === 0) {
      doc.addPage({ size: "A4", margin: 50 });
      tableTop = 0;
      items = items.slice(i);
      i = 0;
    }
  }
  generateHr(doc, tableTop + 22 + items.length * 20);
  const tableBottom = tableTop + 40 + items.length * 20;
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

function generateHr(doc: PDFKit.PDFDocument, y: number) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function generateSymmaryTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  validator: string,
  rewards: string,
  date: string,
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
    .text(validator, 50, y, { width: 90 })
    .text(rewards, 150, y, { width: 170 })
    .text(date, 320, y, { width: 80, align: "left" });
}
